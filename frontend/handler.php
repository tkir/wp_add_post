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
	$post_title    = $_POST['post-title'];
	$post_content  = $_POST['post-data'];
	$post_category = $_POST['post-category'];
	$post_tags     = $_POST['post-tags'];

	$new_post = array(
		'ID'            => isset( $_POST['post-id'] ) ? $_POST['post-id'] : '',
		'post_author'   => $user->ID,
		'post_content'  => $post_content,
		'post_title'    => $post_title,
		'post_category' => array( $post_category ),
		'post_status'   => $_POST['post-status'],         //'draft' | 'publish' | 'pending'| 'future' | 'private'
		'tags_input'    => $post_tags
	);

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

	$post_id = wp_insert_post( $new_post );

	if ( isset( $_FILES['post-thumbnail'] ) ) {
		$attachment_id = media_handle_upload( 'post-thumbnail', $post_id );
		set_post_thumbnail( $post_id, $attachment_id );
	}

	$post = get_post( $post_id );
	wp_redirect( $post->guid );
}