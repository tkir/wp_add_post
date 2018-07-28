<?php

class FPE_Initializer {
	private static $instance;
	private $pageId;

	public static function init() {
		is_null( self::$instance ) AND self::$instance = new self;

		return self::$instance;
	}

	private function __construct() {
		$this->addActions();
	}

	public static function onActivation() {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}

		$plugin = isset( $_REQUEST['plugin'] ) ? $_REQUEST['plugin'] : '';
		check_admin_referer( "activate-plugin_{$plugin}" );

		FPE_Initializer::init()->activation();
	}

	private function activation() {
		$this->createPage();
		$this->addOptions();
	}

	private function createPage() {
		$options = array(
			'menu_order'     => 0,
			//If new post is a page, sets the order should it appear in the tabs.
			'comment_status' => 'closed',
			//'closed' means no comments.
			'ping_status'    => 'closed',
			//Ping status?
			'post_author'    => get_current_user_id(),
			//The user ID number of the author.
			'post_content'   => '[frontendPostEditor]',
			'post_date'      => current_time( 'mysql' ),
			//The time post was made.
			'post_excerpt'   => 'Awesome post editor from frontend',
			//For all your post excerpt needs.
			'post_name'      => 'frontendPostEditor',
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
		$this->pageId = wp_insert_post( $options );
	}

	public function pageContent() {
		ob_start();
		include_once( 'form.php' );

		return ob_get_clean();
	}

	private function addOptions() {
		update_option( 'frontendPostEditor_id', $this->pageId );
		update_option( 'frontendPostEditor_title_edit', 'Edit post' );
		update_option( 'frontendPostEditor_title_create', 'Create post' );
		update_option( 'frontendPostEditor_slug', 'frontendPostEditor' );
		update_option( 'frontendPostEditor_autosave_interval', 15 );

//		policy
		update_option( 'frontendPostEditor_user_access', 'publish_posts' );
		update_option( 'frontendPostEditor_trust_policy', 'after_first' );

//		Medium editor MultiPlaceholders
		update_option( 'frontendPostEditor_me_theme', 'default.css' );
		update_option( 'frontendPostEditor_tag_title', 'h1' );
		update_option( 'frontendPostEditor_placeholder_title', 'Title' );
		update_option( 'frontendPostEditor_tag_body', 'p' );
		update_option( 'frontendPostEditor_placeholder_body', 'Tell your story...' );
	}

	private function addActions() {
		add_action( 'init', array( $this, 'registerPostStatus' ) );
		add_shortcode( 'frontendPostEditor', array( $this, 'pageContent' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_script' ) );

		add_action( 'wp_ajax_tag_autofill', array( $this, 'ajaxTagAutofill' ) );
		add_action( 'wp_ajax_del_autosave', array( $this, 'ajaxDelAutosave' ) );

		add_filter( 'get_edit_post_link', array( $this, 'changeEditPostLink' ), 10, 3 );
		add_filter( 'the_title', array( $this, 'changeTitle' ), 10, 2 );
	}

	public function registerPostStatus() {
		register_post_status( 'autosave', array(
			'public'                    => false,
			'exclude_from_search'       => true,
			'show_in_admin_all_list'    => false,
			'show_in_admin_status_list' => false
		) );
	}

	public function enqueue_script() {
		if ( get_the_ID() != get_option( 'frontendPostEditor_id' ) ) {
			return;
		}

		wp_enqueue_style( 'style', plugin_dir_url( __FILE__ ) . 'css/style.css' );
		wp_enqueue_script( 'script_form', plugin_dir_url( __FILE__ ) . 'js/form.js', false, false, true );

		wp_deregister_script( 'jquery' );
		wp_register_script( 'jquery', ( 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js' ), false, null, false );
		wp_enqueue_script( 'jquery' );

		wp_enqueue_style( 'fontAwesome', 'http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css' );

		wp_enqueue_script( 'handlebars', 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.11/handlebars.runtime.min.js', false, false, true );
		wp_enqueue_script( 'jQuery-sortable', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-sortable/0.9.13/jquery-sortable-min.js', false, false, true );
		wp_enqueue_script( 'jquery-ui-widget', 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.9.2/jquery.ui.widget.min.js', false, false, true );
		wp_enqueue_script( 'jquery-iframe-transport', 'https://cdnjs.cloudflare.com/ajax/libs/jquery.iframe-transport/1.0.1/jquery.iframe-transport.min.js', false, false, true );
		wp_enqueue_script( 'jquery-fileupload', 'https://cdnjs.cloudflare.com/ajax/libs/blueimp-file-upload/9.22.0/js/jquery.fileupload.min.js', false, false, true );

		wp_enqueue_style( 'medium_editor_css', plugin_dir_url( __DIR__ ) . 'medium_editor/MediumEditor/css/medium-editor.min.css' );
		wp_enqueue_style( 'medium_editor_theme', plugin_dir_url( __DIR__ ) . 'medium_editor/MediumEditor/css/themes/' . get_option( 'frontendPostEditor_me_theme' ) );
		wp_enqueue_script( 'medium_editor_js', plugin_dir_url( __DIR__ ) . 'medium_editor/MediumEditor/js/medium-editor.min.js',
			array(
				'jquery',
				'handlebars',
				'jQuery-sortable',
				'jquery-ui-widget',
				'jquery-iframe-transport',
				'jquery-fileupload'
			), null, true );

		wp_enqueue_style( 'medium-editor-insert-plugin-css', plugin_dir_url( __DIR__ ) . 'medium_editor/InsertPlugin/css/medium-editor-insert-plugin.min.css' );
		wp_enqueue_script( 'medium-editor-insert-plugin-js', plugin_dir_url( __DIR__ ) . 'medium_editor/InsertPlugin/js/medium-editor-insert-plugin.min.js', array( 'medium_editor_js' ), false, true );

		wp_enqueue_script( 'medium-editor-multiplaceholders', plugin_dir_url( __DIR__ ) . 'medium_editor/MultiPlaceholders/medium-editor-multi-placeholders-plugin.min.js', array( 'medium_editor_js' ), false, true );

		wp_localize_script( 'script_form', 'fpeConfig', $this->jsConfig() );
	}

	private function jsConfig() {
		return array(
			'ajaxPath'      => admin_url( 'admin-ajax.php' ),
			'nonce'         => wp_create_nonce( 'wp_ajax' ),
			'asInterval'    => intval( get_option( 'frontendPostEditor_autosave_interval' ) ) * 1000,
			'tagTitle'      => get_option( 'frontendPostEditor_tag_title' ),
			'phTitle'       => get_option( 'frontendPostEditor_placeholder_title' ),
			'tagBody'       => get_option( 'frontendPostEditor_tag_body' ),
			'phBody'        => get_option( 'frontendPostEditor_placeholder_body' ),
			'fpe_tag_title' => get_option( 'frontendPostEditor_tag_title' ),
			'fpe_ph_title'  => get_option( 'frontendPostEditor_placeholder_title' ),
			'tag_body'      => get_option( 'frontendPostEditor_tag_body' ),
			'ph_body'       => get_option( 'frontendPostEditor_placeholder_body' )
		);
	}

	public function ajaxTagAutofill() {
		$nonce = $_POST['nonce'];
		if ( ! wp_verify_nonce( $nonce, 'wp_ajax' ) ) {
			die ( 'Busted!' );
		}

		global $wpdb;
		$tag     = esc_sql( $_POST['tag'] );
		$tagsArr = array();

		$tags = $wpdb->get_results( "
SELECT name FROM `wp_terms`
	WHERE term_id IN ( SELECT term_id FROM wp_term_taxonomy WHERE taxonomy='post_tag' )
	AND name = '$tag'
	" );
		if ( ! empty( $tags ) ) {
			foreach ( $tags as $value ) {
				array_push( $tagsArr, $value->name );
			}
		}

		$tags = $wpdb->get_results( "
SELECT name FROM `wp_terms`
	WHERE term_id IN ( SELECT term_id FROM wp_term_taxonomy WHERE taxonomy='post_tag' )
	AND name LIKE '$tag%' LIMIT 6
	" );
		if ( ! empty( $tags ) ) {
			foreach ( $tags as $value ) {
				array_push( $tagsArr, $value->name );
			}

			$tagsArr = array_unique( $tagsArr );
			while ( count( $tagsArr ) > 6 ) {
				array_pop( $tagsArr );
			}
		}

		if ( count( $tagsArr ) < 6 ) {
			$tags = $wpdb->get_results( "
SELECT name FROM `wp_terms`
	WHERE term_id IN ( SELECT term_id FROM wp_term_taxonomy WHERE taxonomy='post_tag' )
	AND name LIKE '%$tag%'
	" );

			if ( ! empty( $tags ) ) {
				foreach ( $tags as $value ) {
					array_push( $tagsArr, $value->name );
				}

				$tagsArr = array_unique( $tagsArr );
				while ( count( $tagsArr ) > 6 ) {
					array_pop( $tagsArr );
				}
			}
		}


		header( "Content-Type: application/json" );
		echo json_encode( $tagsArr );

		wp_die();
	}

	public function ajaxDelAutosave() {
		$nonce = $_POST['nonce'];
		if ( ! wp_verify_nonce( $nonce, 'wp_ajax' ) ) {
			die ( 'Busted!' );
		}

		header( "Content-Type: application/json" );

		$id = esc_sql( $_POST['id'] );
		if ( ! $id ) {
			echo json_encode( array( 'result' => 'no post' ) );
			wp_die();
		}

		$post = get_posts(
			array(
				'post_status' => 'autosave',
				'post_author' => get_current_user_id(),
				'ID'          => $id,
			) );
		if ( empty( $post ) ) {
			echo json_encode( array( 'error' => 'no post autosave' ) );
			wp_die();
		}

		wp_delete_post( $post[0]->ID, true );

		echo json_encode( array( 'result' => 'complete' ) );
		wp_die();
	}

	public function changeEditPostLink( $link, $post_id, $context ) {
		if ( current_user_can( 'edit_others_posts' ) ) {
			return $link;
		}

		return home_url() . "/" . get_option( 'frontendPostEditor_slug' ) . "?id=$post_id";
	}

	public function changeTitle( $title, $id ) {
		if ( $id == get_option( 'frontendPostEditor_id' ) ) {
			return ( isset( $_GET['id'] ) ) ? get_option( 'frontendPostEditor_title_edit' ) : get_option( 'frontendPostEditor_title_create' );
		} else {
			return $title;
		}
	}

//-----------------------------------------------------------------------------------------------------------------//
//	Deactivation part
	public static function onDeactivation() {
		FPE_Initializer::init()->deactivation();
	}

	private function deactivation() {
		$this->deletePage();
		$this->deleteOption();
	}

	private function deletePage() {
		wp_delete_post( get_option( 'frontendPostEditor_id' ), true );
	}

	private function deleteOption() {
		delete_option( 'frontendPostEditor_id' );
		delete_option( 'frontendPostEditor_title_edit' );
		delete_option( 'frontendPostEditor_title_create' );
		delete_option( 'frontendPostEditor_slug' );
		delete_option( 'frontendPostEditor_autosave_interval' );

//		policy
		delete_option( 'frontendPostEditor_user_access' );
		delete_option( 'frontendPostEditor_trust_policy' );

//		Medium editor MultiPlaceholders
		delete_option( 'frontendPostEditor_me_theme' );
		delete_option( 'frontendPostEditor_tag_title' );
		delete_option( 'frontendPostEditor_placeholder_title' );
		delete_option( 'frontendPostEditor_tag_body' );
		delete_option( 'frontendPostEditor_placeholder_body' );
	}
}