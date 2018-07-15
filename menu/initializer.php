<?php

class FPE_Menu_Initializer {
	private static $instance;

	public static function init() {
		is_null( self::$instance ) AND self::$instance = new self;

		return self::$instance;
	}

	private function __construct() {
		$this->addActions();
	}

	private function pageContent() {
		ob_start();
		include_once( 'general.php' );

		return ob_get_clean();
	}

	private function addActions() {
		add_action( 'admin_menu', array( $this, 'addMenuGeneral' ) );
	}

	public function addMenuGeneral() {
		add_options_page( 'Frontend Post Editor',
			'FrontendPostEditor',
			'edit_plugins',
			'FrontendPostEditor',
			$this->pageContent() );
	}

	public function enqueue_script() {
//		if ( get_the_ID() != get_option( 'frontendPostEditor_id' ) ) {
//			return;
//		}

		wp_enqueue_style( 'style', plugin_dir_url( __FILE__ ) . 'css/style.css' );
		wp_enqueue_script( 'script', plugin_dir_url( __FILE__ ) . 'js/script.js', false, false, true );

		wp_localize_script( 'script', 'fpeMenuConfig', array(
			'ajaxPath'    => admin_url( 'admin-ajax.php' ),
			'nonce'       => wp_create_nonce( 'wp_ajax' )
		) );
	}

//	public function ajaxTagAutofill() {
//		$nonce = $_POST['nonce'];
//		if ( ! wp_verify_nonce( $nonce, 'wp_ajax' ) ) {
//			die ( 'Busted!' );
//		}
//
//		global $wpdb;
//		$tag = esc_sql( $_POST['tag'] );
//
//		$tags = $wpdb->get_results( "
//SELECT name FROM `wp_terms`
//	WHERE term_id IN ( SELECT term_id FROM wp_term_taxonomy WHERE taxonomy='post_tag' )
//	AND name LIKE '%$tag%'
//	" );
//
//		header( "Content-Type: application/json" );
//		echo json_encode( $tags );
//
//		wp_die();
//	}
//
//	public function changeEditPostLink( $link, $post_id, $context ) {
//		return home_url() . "/" . get_option( 'frontendPostEditor_slug' ) . "?id=$post_id";
//	}
}