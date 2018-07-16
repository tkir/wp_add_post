<?php
$id = false;
if ( isset( $_GET['id'] ) ) {
	$id       = $_GET['id'];
	$postData = get_post( $id, ARRAY_A );

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

    <label class="" for="post-category">Категория
		<?php wp_dropdown_categories(
			array(
				'class'        => '',                 //сюда выставить классы для select
				'name'         => 'post-category',
				'hierarchical' => 1,                  //выводить сплошным списком или иерархией
				'hide_empty'   => 0,
				'selected'     => isset( $postData ) ? $postData['post_category'][0] : 0
			)
		); ?>
    </label>

    <div data-editor></div>

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

    <button type="button" data-btn="btnCancel">Cancel</button>
    <button type="button" data-btn="btnDraft">Draft</button>
    <button type="button" data-btn="btnSubmit">Publish</button>

</form>
