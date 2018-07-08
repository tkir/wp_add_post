<form method="post"
      name="add-post"
      enctype="multipart/form-data"
      onsubmit="textProcessing();"
      action="<?php echo plugin_dir_url( __FILE__ ) . 'handler.php'; ?>">
	<?php wp_nonce_field( 'add_post_action', 'add_post_nonce' ); ?>

    <input type="hidden" name="post-title">
    <input type="hidden" name="post-data">

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
    <input type="button" value="Publish" onclick="textProcessing();">

</form>