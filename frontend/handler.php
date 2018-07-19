<?php
$parse_uri = explode( 'wp-content', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );
require_once( ABSPATH . 'wp-admin/includes/image.php' );
require_once( ABSPATH . 'wp-admin/includes/file.php' );
require_once( ABSPATH . 'wp-admin/includes/media.php' );

define( 'WP_USE_THEMES', false );

if (
	isset( $_POST['add_post_nonce'] )
	&& wp_verify_nonce( $_POST['add_post_nonce'], 'add_post_action' )
	&& current_user_can( 'publish_posts' )
) {
	$author_id     = isset( $_POST['post-id'] ) ? get_post_field( 'post_author', $_POST['post-id'] ) : get_current_user_id();
	$post_title    = $_POST['post-title'];
	$post_id       = isset( $_POST['post-id'] ) ? $_POST['post-id'] : '';
	$post_content  = $_POST['post-data'];
	$post_category = $_POST['post-category'];
	$post_tags     = $_POST['post-tags'];
	$post_status   = getPostStatus( $author_id );
	$post_parent   = isset( $_POST['[post-parent'] ) ? $_POST['post-parent'] : 0;

	$postData = array(
		'ID'            => $post_id,
		'post_author'   => $author_id,
		'post_content'  => $post_content,
		'post_title'    => $post_title,
		'post_category' => array( $post_category ),
		'post_status'   => $post_status,
		'tags_input'    => $post_tags,
		'post_parent'   => $post_parent
	);

	$post_content = fpe_saveImagesFromPot( $post_content );

	$post_id = ( is_null( get_post( $post_id ) ) ) ?
		wp_insert_post( $postData ) : wp_update_post( $postData );

//	check thumbnamil
	if ( isset( $_FILES['post-thumbnail'] ) && $_FILES['post-thumbnail']['size'] ) {
		$thumbId = media_handle_upload( 'post-thumbnail', $post_id );
		set_post_thumbnail( $post_id, $thumbId );
	}

//	if autosave - die
	if ( $post_status == 'autosave' ) {
		echo json_encode( array( 'result' => get_post( $post_id ) ) );
		die();
	}

	$post = get_post( $post_id );
	wp_redirect( $post->guid );
}

/**
 * Check is images in post content? Save images, update post content
 *
 * @param string $post_content
 *
 * @return string post_content
 */
function fpe_saveImagesFromPot( $post_content ) {
	if ( preg_match_all( '/\\\\"data:image\/([^;]*);base64,([^\\\\]*)\\\\"/', $post_content, $matches ) ) {

		$upload_dir  = wp_upload_dir();
		$upload_path = str_replace( '/', DIRECTORY_SEPARATOR, $upload_dir['path'] ) . DIRECTORY_SEPARATOR;
		$upload_url  = str_replace( '/', DIRECTORY_SEPARATOR, $upload_dir['url'] ) . DIRECTORY_SEPARATOR;

		for ( $i = 0; $i < count( $matches[1] ); $i ++ ) {
			$decoded  = base64_decode( $matches[2][ $i ] );
			$filename = md5( $matches[2][ $i ] . microtime() ) . '.' . $matches[1][ $i ];
			file_put_contents( $upload_path . $filename, $decoded );
			$post_content = str_replace( $matches[0][ $i ], $upload_url . $filename, $post_content );
		}
	}

	return $post_content;
}

function getPostStatus( $author_id ) {
	switch ( $_POST['post-status'] ) {
		case 'draft':
			return 'draft';
		case 'autosave':
			return 'autosave';
		default:
			return get_user_meta( $author_id, 'fpeUserTrust', true ) ? 'publish' : 'pending';
	}
}