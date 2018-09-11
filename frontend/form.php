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
    <input type="hidden" name="post-name">
    <input type="hidden" name="post-parent">

    <div class="story-panel">
        <div class="container">
            <button type="button" data-btn="btnCancel" class="cancel">Удалить</button>
            <div class="buttons-groupe">
                <button type="button" data-btn="btnClear" class="clear">Очистить</button>
                <button type="button" data-btn="btnDraft" class="draft">В черновик</button>
                <button type="button" data-btn="btnSubmit" class="publish">Опубликовать</button>
            </div>
        </div>
    </div>
    <main class="layoutBody clearfix noThumb">
        <article class="postSingle postSingle--fullwidth postSingle--headerWide hentry post-39947 page type-page status-publish noThumb">
            <div class="container">
                <div class="layoutContent">
                    <div class="contentWrap">
                        <div class="postContent postContent--fullwidth bodyCopy entry-content">
                            <div data-editor-wrapper>
                                <template>
                                    <div data-editor></div>
                                </template>
                            </div>
                            <div data-tags class="postFooter-bottom">
                                <ul class="postTags-list">
                                    <template data-template="liTag">
                                        <li class="postTag tag"><span></span><i class="fa fa-times-circle"></i></li>
                                    </template>
                                </ul>
                                <input type="text" placeholder="Добавьте до 5 тегов ...">
                                <button style="display: none;" type="button" data-btn="btnPlus">+</button>

                                <!--кнопки с автодобавлением тегов-->

                                <div data-autocomplete class="tags-autocomplete-popover">
                                    <ul class="tags-autocomplete">
                                        <template data-template="btnAutocomplete">
                                            <li><span></span></li>
                                        </template>
                                    </ul>
                                </div>

                            </div>
                            <label class="" for="post-category">Категория
                                <?php wp_dropdown_categories(
                                    array(
                                        'class'        => '',                 //сюда выставить классы для select
                                        'name'         => 'post-category',
                                        'hierarchical' => 0,                  //выводить сплошным списком или иерархией
                                        'hide_empty'   => 0,
                                        'selected'     => isset( $postData ) ? $postData['post_category'][0] : 0
                                    )
                                ); ?>
                            </label>

                            <div data-thumbnail>
                                <input type="file" name="post-thumbnail" multiple="false">
                                <img>
                            </div>
                        </div>
                    </div>

                </div><!-- end layoutContent -->
            </div><!-- end container -->

        </article>
    </main>

</form>

