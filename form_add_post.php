<form method="post"
      name="add-post"
      enctype="multipart/form-data"
      onsubmit="textProcessing();"
      action="<?php echo plugin_dir_url( __FILE__ ) . 'handler.php'; ?>">
	<?php wp_nonce_field( 'add_post_action', 'add_post_nonce' ); ?>

    <div style="display: none">
        <input type="text" name="post-title">
        <input type="text" name="post-data">
    </div>

    <div class="editable"></div>
    <input type="button" value="Publish" onclick="textProcessing();">

</form>