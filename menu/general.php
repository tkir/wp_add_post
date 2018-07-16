<div id="fpe-menuGeneral">
    <h1>General settings</h1>

    <div data-update="frontendPostEditor_title_edit">
        <label> Edit page title
            <input type="text" value="<?= get_option( 'frontendPostEditor_title_edit' ); ?>">
        </label>
        <button>Update</button>
    </div>

    <div data-update="frontendPostEditor_title_create">
        <label> Create page title
            <input type="text" value="<?= get_option( 'frontendPostEditor_title_create' ); ?>">
        </label>
        <button>Update</button>
    </div>

    <div data-update="frontendPostEditor_slug">
        <label> Page slug
            <input type="text" value="<?= get_option( 'frontendPostEditor_slug' ); ?>">
        </label>
        <button>Update</button>
    </div>

    <hr>

    <div data-update="frontendPostEditor_tag_title">
        <label> Placeholder title tag
            <input type="text" value="<?= get_option( 'frontendPostEditor_tag_title' ); ?>">
        </label>
        <button>Update</button>
    </div>
    <div data-update="frontendPostEditor_placeholder_title">
        <label> Placeholder title placeholder
            <input type="text" value="<?= get_option( 'frontendPostEditor_placeholder_title' ); ?>">
        </label>
        <button>Update</button>
    </div>

    <div data-update="frontendPostEditor_tag_body">
        <label> Placeholder post tag
            <input type="text" value="<?= get_option( 'frontendPostEditor_tag_body' ); ?>">
        </label>
        <button>Update</button>
    </div>
    <div data-update="frontendPostEditor_placeholder_body">
        <label> Placeholder post placeholder
            <input type="text" value="<?= get_option( 'frontendPostEditor_placeholder_body' ); ?>">
        </label>
        <button>Update</button>
    </div>

    <div data-update="frontendPostEditor_user_access">
        <label>User access
            <select>
                <option value="manage_sites" <?= get_option('frontendPostEditor_user_access')=='manage_sites'?'selected':'';?>>Super admin</option>
                <option value="edit_users" <?= get_option('frontendPostEditor_user_access')=='edit_users'?'selected':'';?>>Admin</option>
                <option value="edit_others_posts" <?= get_option('frontendPostEditor_user_access')=='edit_others_posts'?'selected':'';?>>Editor</option>
                <option value="publish_posts" <?= get_option('frontendPostEditor_user_access')=='publish_posts'?'selected':'';?>>Author</option>
                <option value="edit_posts" <?= get_option('frontendPostEditor_user_access')=='edit_posts'?'selected':'';?>>Contributor</option>
                <option value="read" <?= get_option('frontendPostEditor_user_access')=='read'?'selected':'';?>>Subscriber</option>
            </select>
        </label>
    </div>
</div>