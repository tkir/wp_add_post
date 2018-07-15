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

	public function pageContent() {
		ob_start();
		include_once( 'general.php' );

		echo ob_get_clean();
	}

	private function addActions() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_script' ) );
		add_action( 'admin_menu', array( $this, 'addMenuGeneral' ) );
		if ( defined( 'DOING_AJAX' ) ) {
			add_action( 'wp_ajax_fpe_menuGeneral', array( $this, 'ajaxMenuGeneralUpdate' ) );
		}
	}

	public function addMenuGeneral() {
		add_options_page( 'Frontend Post Editor',
			'FrontendPostEditor',
			'edit_plugins',
			'FrontendPostEditor',
			array( $this, 'pageContent' ) );
	}

	public function enqueue_script() {
		wp_deregister_script( 'jquery' );
		wp_register_script( 'jquery', ( 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js' ), false, null, false );
		wp_enqueue_script( 'jquery' );

		wp_enqueue_style( 'style', plugin_dir_url( __FILE__ ) . 'css/style.css' );
		wp_enqueue_script( 'script', plugin_dir_url( __FILE__ ) . 'js/menuGeneral.js', false, false, true );

		wp_localize_script( 'script', 'fpeMenuConfig', array(
			'ajaxPath' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'wp_menu_ajax' )
		) );
	}

	public function ajaxMenuGeneralUpdate() {
		$nonce = $_POST['nonce'];
		if ( ! wp_verify_nonce( $nonce, 'wp_menu_ajax' ) &&
		     ! current_user_can( 'edit_plugins' ) ) {
			die ( 'Busted!' );
		}

		$req = $_POST['body'];
		if($req['name']=='frontendPostEditor_slug'){
			$req['data']=str_replace(array('~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '=', '+', '[',']','{','}', ':',';','"', "'", '|',
				'<', '>', ',', '.', '?', '/', ' ', '\/'), '', $req['data']);
			$req['data']=esc_sql($req['data']);
			wp_update_post(array(
				'ID'=>get_option('frontendPostEditor_id'),
				'post_name'      => $req['data'],
			));
		}
		update_option( esc_sql( $req['name'] ), esc_sql( $req['data'] ) );

		$response       = new stdClass();
		$response->name = $req['name'];
		$response->data = get_option( $req['name'] );

		header( "Content-Type: application/json" );
		echo json_encode( $response );

		wp_die();
	}
}