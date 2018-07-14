<?php
/*
Plugin Name: Add Post
Plugin URI: http://tkir.github.io/wp_add_post
Description: Wordpress plugin for adding post without admin
Version: 1.0
Author: Kirill Titenko
Author URI: http://github.com/tkir/
*/

/*  Copyright 2018  Kirill Titenko  (email: kirill.titenko@gmail.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/**
 * Plugin initialization
 */

register_activation_hook( __FILE__, 'on_activation' );
function on_activation() {
	$options = array(
		'menu_order'     => 0,
		//If new post is a page, sets the order should it appear in the tabs.
		'comment_status' => 'closed',
		//'closed' means no comments.
		'ping_status'    => 'closed',
		//Ping status?
		'post_author'    => get_current_user_id(),
		//The user ID number of the author.
		'post_content'   => '[wp_add_post]',
		'post_date'      => current_time( 'mysql' ),
		//The time post was made.
		'post_excerpt'   => 'constructor for creating perfect business cards',
		//For all your post excerpt needs.
		'post_name'      => 'wp_post_edit',
		//The name (slug) for your post
		'post_parent'    => 0,
		//Sets the parent of the new post.
		'post_status'    => 'publish',
		//Set the status of the new post.
		'post_title'     => 'Edit post',
		//The title of your post.
		'post_type'      => 'page',
		//Sometimes you want to post a page.
		'tags_input'     => ''
		//For tags.
	);
	// Insert the post into the database
	$page_id = wp_insert_post( $options );
}

register_deactivation_hook( __FILE__, 'on_deactivation' );
function on_deactivation() {
	delete_option( 'wp_add_post_id' );
}


add_shortcode( 'wp_add_post', 'add_short' );
function add_short() {
	update_option( 'wp_add_post_id', get_the_ID() );
	ob_start();
	include_once( 'form_add_post.php' );

	return ob_get_clean();
}

add_action( 'wp_enqueue_scripts', 'true_include_script' );
function true_include_script() {
	if ( get_the_ID() != get_option( 'wp_add_post_id' ) ) {
		return;
	}

	wp_enqueue_style( 'style', plugin_dir_url( __FILE__ ) . 'css/style.css' );
	wp_enqueue_script( 'scripts', plugin_dir_url( __FILE__ ) . 'js/scripts.js', false, false, true );
	wp_deregister_script( 'jquery' );
	wp_register_script( 'jquery', ( 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js' ), false, null, false );
	wp_enqueue_script( 'jquery' );

	wp_enqueue_style( 'fontAwesome', 'http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css' );
	wp_enqueue_style( 'medium_editor_css', 'https://cdn.jsdelivr.net/npm/medium-editor@5.23.2/dist/css/medium-editor.min.css' );
	wp_enqueue_script( 'medium_editor_js', 'https://cdn.jsdelivr.net/npm/medium-editor@5.23.2/dist/js/medium-editor.min.js', array(), null, true );

	wp_enqueue_script( 'handlebars', 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.11/handlebars.runtime.min.js', false, false, true );
	wp_enqueue_script( 'jQuery-sortable', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-sortable/0.9.13/jquery-sortable-min.js', false, false, true );
	wp_enqueue_script( 'jquery-ui-widget', 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.9.2/jquery.ui.widget.min.js', false, false, true );
	wp_enqueue_script( 'jquery-iframe-transport', 'https://cdnjs.cloudflare.com/ajax/libs/jquery.iframe-transport/1.0.1/jquery.iframe-transport.min.js', false, false, true );
	wp_enqueue_script( 'jquery-fileupload', 'https://cdnjs.cloudflare.com/ajax/libs/blueimp-file-upload/9.22.0/js/jquery.fileupload.min.js', false, false, true );

	wp_enqueue_style( 'medium-editor-insert-plugin-css', 'https://cdnjs.cloudflare.com/ajax/libs/medium-editor-insert-plugin/2.5.0/css/medium-editor-insert-plugin.min.css' );
	wp_enqueue_script( 'medium-editor-insert-plugin-js', 'https://cdnjs.cloudflare.com/ajax/libs/medium-editor-insert-plugin/2.5.0/js/medium-editor-insert-plugin.min.js', false, false, true );

	wp_enqueue_script( 'Multiplaceholders', plugin_dir_url( __FILE__ ) . 'medium_editor/Multiplaceholders/medium-editor-multi-placeholders-plugin.min.js', false, false, true );
	wp_add_inline_script( 'Multiplaceholders', "mediumEditorInit();" );

	wp_localize_script( 'scripts', 'ajax_config', array(
		'path'  => admin_url( 'admin-ajax.php' ),
		'nonce' => wp_create_nonce( 'wp_ajax' )
	) );
}

add_action( 'wp_ajax_tag_autocomplete', 'tag_autocomplete' );
function tag_autocomplete() {
	$nonce = $_POST['nonce'];
	if ( ! wp_verify_nonce( $nonce, 'wp_ajax' ) ) {
		die ( 'Busted!' );
	}

	global $wpdb;
	$tag = esc_sql( $_POST['tag'] );

	$tags = $wpdb->get_results( "
SELECT name FROM `wp_terms`
	WHERE term_id IN ( SELECT term_id FROM wp_term_taxonomy WHERE taxonomy='post_tag' )
	AND name LIKE '%$tag%'
	" );

	header( "Content-Type: application/json" );
	echo json_encode( $tags );

	wp_die();
}


//редактируем ссылку на edit post
add_filter( 'get_edit_post_link', 'change_edit_post_link', 10, 3 );
function change_edit_post_link( $link, $post_id, $context ) {
	$newLink = home_url() . "/wp_post_edit?id=$post_id";
	return $newLink;
}
