<meta charset="utf-8">
<?php if ( ! current_user_can( get_option( 'frontendPostEditor_user_access' ) ) ): ?>
    <script>location.href = "<?= home_url(); ?>";</script>
<?php endif; ?>

<?php


$id = '';

//check is editing post
if ( isset( $_GET['id'] ) ) {
	$id = $_GET['id'];
}

//check is autosave
$post_auto = get_posts( array(
	'post_status'    => 'autosave',
	'post_author'    => get_current_user_id(),
	'post_parent'    => $id ? $id : 0,
	'posts_per_page' => 1
) );

if ( ! empty( $post_auto ) ) {
	$id = $post_auto[0]->ID;
}

//if post exists fill variable for js
if ( $id ) {
	$postData = get_post( $id, ARRAY_A , 'raw');

	if ( get_the_post_thumbnail_url( $id ) ) {
		$postData['post-thumb'] = get_the_post_thumbnail_url( $id );
	}

	wp_localize_script( 'script_form', 'fpe_post', $postData );
}


?>

<form id="fpeForm"
      method="post"
      name="add-post"
      enctype="multipart/form-data"
      action="<?php echo plugin_dir_url( __FILE__ ) . 'handler.php'; ?>">
	<?php wp_nonce_field( 'add_post_action', 'add_post_nonce' ); ?>

    <input type="hidden" name="post-id">
    <input type="hidden" name="post-title">
    <input type="hidden" name="post-data">
    <input type="hidden" name="post-tags">
    <input type="hidden" name="post-status">
    <input type="hidden" name="post-parent">

    <span class="">Категория
		<?php wp_dropdown_categories(
			array(
				'show_option_all'    => 'Выберите категорию вашей публикации',
				'class'        => '',                 //сюда выставить классы для select
				'name'         => 'post-category',
				'hierarchical' => 1,                  //выводить сплошным списком или иерархией
				'hide_empty'   => 0,
				'selected'     => isset( $postData ) ? $postData['post_category'][0] : 0
			)
		); ?>
    </span>

    <div data-editor-wrapper>
        <template>
            <div data-editor></div>
        </template>
    </div>

    <div data-tags>
        <ul>
            <template data-template="liTag">
                <li class="tag"><span></span></li>
            </template>
        </ul>
        <input type="text" placeholder="enter tag">
        <button type="button" data-btn="btnPlus">+</button>

        <!--        кнопки с автодобавлением тегов-->
        <div data-autocomplete>
            <template data-template="btnAutocomplete">
                <button><span></span></button>
            </template>
        </div>
    </div>

    <div data-thumbnail>
        <label> Thumbnail
            <input type="file" name="post-thumbnail" multiple="false">
            <img>
        </label>
    </div>

    <button type="button" data-btn="btnClear">Clear</button>
    <button type="button" data-btn="btnCancel">Cancel</button>
    <button type="button" data-btn="btnDraft">Draft</button>
    <button type="button" data-btn="btnSubmit">Publish</button>

</form>
