<div id="fpe-menuGeneral">
    <h1>Frontend post editor settings</h1>

    <h2>General</h2>
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
    <h2>Medium editor</h2>
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

    <hr>
    <h2>Policy</h2>
    <div data-update="frontendPostEditor_user_access">
        <label>User access
            <select>
                <option value="manage_sites" <?= get_option( 'frontendPostEditor_user_access' ) == 'manage_sites' ? 'selected' : ''; ?>>
                    Super admin
                </option>
                <option value="edit_users" <?= get_option( 'frontendPostEditor_user_access' ) == 'edit_users' ? 'selected' : ''; ?>>
                    Admin
                </option>
                <option value="edit_others_posts" <?= get_option( 'frontendPostEditor_user_access' ) == 'edit_others_posts' ? 'selected' : ''; ?>>
                    Editor
                </option>
                <option value="publish_posts" <?= get_option( 'frontendPostEditor_user_access' ) == 'publish_posts' ? 'selected' : ''; ?>>
                    Author
                </option>
                <option value="edit_posts" <?= get_option( 'frontendPostEditor_user_access' ) == 'edit_posts' ? 'selected' : ''; ?>>
                    Contributor
                </option>
                <option value="read" <?= get_option( 'frontendPostEditor_user_access' ) == 'read' ? 'selected' : ''; ?>>
                    Subscriber
                </option>
            </select>
        </label>
    </div>

    <div data-update="frontendPostEditor_trust_policy">
        <span>Trust policy<br>
            <label>
                <input type="radio" name="trust_policy"
                       value="trust_all" <?= get_option( 'frontendPostEditor_trust_policy' ) == 'trust_all' ? 'checked' : ''; ?>>
                Trust all author except untrusted<br></label>
            <label>
                <input type="radio" name="trust_policy"
                       value="after_first" <?= get_option( 'frontendPostEditor_trust_policy' ) == 'after_first' ? 'checked' : ''; ?>>
                Trust author after first publish<br></label>
            <label>
                <input type="radio" name="trust_policy"
                       value="trust_never" <?= get_option( 'frontendPostEditor_trust_policy' ) == 'trust_never' ? 'checked' : ''; ?>>
                All posts to pending except trusted</label>
        </span>
    </div>
</div>