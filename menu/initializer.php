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
			add_action( 'wp_ajax_fpe_userTrust', array( $this, 'ajaxMenuUserTrust' ) );
		}

//		добавляют столбец в вкладке User
		add_filter( 'manage_users_columns', array( $this, 'addUserColumn' ) );
		add_filter( 'manage_users_custom_column', array( $this, 'addUserRows' ), 10, 3 );

//		изменение статуса поста
		add_filter( 'transition_post_status', array( $this, 'postStatusChange' ), 10, 3 );
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
		wp_enqueue_script( 'script', plugin_dir_url( __FILE__ ) . 'js/menu.js', false, false, true );

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

//		только если опция изменена
		if ( get_option( $req['name'] ) != $req['data'] ) {

			if ( $req['name'] == 'frontendPostEditor_slug' ) {
				$this->slugChanged($req['data']);
			}

			if ( $req['name'] == 'frontendPostEditor_trust_policy' ) {
				$this->trustPolicyChanged( $req['data'] );
			}

			update_option( esc_sql( $req['name'] ), esc_sql( $req['data'] ) );
		}
		$response       = new stdClass();
		$response->name = $req['name'];
		$response->data = get_option( $req['name'] );

		header( "Content-Type: application/json" );
		echo json_encode( $response );

		wp_die();
	}

	public function ajaxMenuUserTrust() {
		$nonce = $_POST['nonce'];
		if ( ! wp_verify_nonce( $nonce, 'wp_menu_ajax' ) &&
		     ! current_user_can( 'edit_users' ) ) {
			die ( 'Busted!' );
		}

		$req = $_POST['body'];
		if ( isset( $req['userId'] ) && isset( $req['userTrust'] ) ) {
			update_user_meta( $req['userId'], 'fpeUserTrust', $req['userTrust'] );
		}

		wp_die();
	}

	private function slugChanged($newSlug){
		$newSlug = str_replace( array(
			'~',
			'`',
			'!',
			'@',
			'#',
			'$',
			'%',
			'^',
			'&',
			'*',
			'(',
			')',
			'=',
			'+',
			'[',
			']',
			'{',
			'}',
			':',
			';',
			'"',
			"'",
			'|',
			'<',
			'>',
			',',
			'.',
			'?',
			'/',
			' ',
			'\/'
		), '', $newSlug );
		$newSlug = esc_sql( $newSlug );
		wp_update_post( array(
			'ID'        => get_option( 'frontendPostEditor_id' ),
			'post_name' => $newSlug,
		) );
	}

	private function trustPolicyChanged( $newPolicy ) {
		$oldPolicy = get_option( 'frontendPostEditor_trust_policy' );

		if($oldPolicy=='trust_all' && $newPolicy=='after_first'){

		}
		else if($oldPolicy=='trust_all' && $newPolicy=='trust_never'){

		}
		else if($oldPolicy=='after_first' && $newPolicy=='trust_all'){

		}
		else if($oldPolicy=='after_first' && $newPolicy=='trust_never'){

		}
		else if($oldPolicy=='trust_never' && $newPolicy=='trust_all'){

		}
		else if($oldPolicy=='trust_never' && $newPolicy=='after_first'){

		}
	}

	public function addUserColumn( $columns ) {
		$columns['trust'] = 'Post trust';

		return $columns;
	}

	public function addUserRows( $val, $column_name, $user_id ) {
		if ( $column_name == 'trust' ) {
			$trusted = get_user_meta( $user_id, 'fpeUserTrust', true ) ? 'checked' : '';

			return "<input type='checkbox' data-user='$user_id' $trusted>";
		}

		return $val;
	}

	public function postStatusChange( $new_status, $old_status, $post ) {
		if ( $new_status != 'publish' && $new_status != 'future' ) {
			return $new_status;
		}

		if ( ! current_user_can( 'edit_users' ) ) {
			return $old_status;
		}

		update_user_meta( $post->post_author, 'fpeUserTrust', true );

		return $new_status;
	}
}