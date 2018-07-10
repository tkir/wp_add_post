<form id="wp_add_post"
      method="post"
      name="add-post"
      enctype="multipart/form-data"
      onsubmit="textProcessing();"
      action="<?php echo plugin_dir_url( __FILE__ ) . 'handler.php'; ?>">
	<?php wp_nonce_field( 'add_post_action', 'add_post_nonce' ); ?>

    <input type="hidden" name="post-title">
    <input type="hidden" name="post-data">
    <input type="hidden" name="post-tags">

    <label class="" for="post-category">Категория</label>
	<?php wp_dropdown_categories(
		array(
			'show_option_all'  => 'Select category',
			'show_option_none' => 'No category',
			'show_count'       => true,
			'class'            => '',                 //сюда выставить классы для select
			'name'             => 'post-category',
			'hierarchical'     => 0,                  //выводить сплошным списком или иерархией
		)
	); ?>

    <div class="editable"></div>

    <div data-tags>
        <ul>
            <template data-template="liTag">
                <li class="tag"><span></span></li>
            </template>
        </ul>
        <input type="text" placeholder="enter tag">
        <input type="button" value="+">

<!--        кнопки с автодобавлением тегов-->
        <div data-autocomplete class="">
            <template data-template="btnAutocomplete">
                <button><span></span></button>
            </template>
        </div>
    </div>

    <input type="submit" value="Publish" onsubmit="submitClick();">

</form>

