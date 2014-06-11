<?php
/*
Plugin Name: Album cover finder
Plugin URI: labs.urre.me/albumcoverfinder/
Description: A simple plugin for finding album cover art via the LastFM API. You can set attachment, featured image and insert cover in post editor
Version: 0.4
Author: Urban Sanden
Author URI: http://urre.me
Author Email: hej@urre.me
License: GPL2
*/

/*  Copyright 2104 Urban Sanden (email: hej@urre.me)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/


class AlbumCoverFinder {

function __construct() {

    # Load plugin text domain
    add_action( 'init', array( $this, 'plugin_textdomain' ) );

    # Register admin styles and scripts
    add_action( 'admin_print_styles', array( $this, 'register_admin_styles' ) );
    add_action( 'admin_enqueue_scripts', array( $this, 'register_admin_scripts' ) );

    # Ajax functions
    add_action('wp_ajax_and_action', array( $this, 'xhr') );
    add_action('wp_ajax_nopriv_and_action', array( $this, 'xhr') );
    add_action( 'init', array( $this, 'add_search_boxes' ) );

}

/**
 * Text domain for translations
 * @return [type] [description]
 */
public function plugin_textdomain() {
    $domain = 'albumcoverfinder';
    $locale = apply_filters( 'plugin_locale', get_locale(), $domain );
    load_textdomain( $domain, WP_LANG_DIR.'/'.$domain.'/'.$domain.'-'.$locale.'.mo' );
    load_plugin_textdomain( $domain, FALSE, dirname( plugin_basename( __FILE__ ) ) . '/lang/' );
}

/**
 * Admin CSS
 * @return [type] [description]
 */
public function register_admin_styles() {
    if (is_admin()) {
        wp_enqueue_style( 'albumcoverfinder-plugin-styles', plugins_url( 'album-cover-finder/css/admin.css' ) );
    }
}

/**
 * Enque and localize javascript
 * @return [type] [description]
 */
public function register_admin_scripts() {

    # Enqueue script
    wp_enqueue_script( 'albumcoverfinder-admin-script', plugins_url( 'album-cover-finder/js/admin.js' ), array('jquery') );

    $js_data = array(
        'view'      => __( 'View', 'albumcoverfinder' ),
        'hide'      => __( 'Hide', 'albumcoverfinder' ),
        'set'       => __('Set featured image', 'albumcoverfinder'),
        'savefirst' => __('Update/publish first', 'albumcoverfinder'),
        'remove'    => __('Remove attachment', 'albumcoverfinder'),
        'files'     => __('files attached', 'albumcoverfinder'),
        'searching' => __('Searching...', 'albumcoverfinder'),
        'search'    => __('Search', 'albumcoverfinder'),
        'nofound'   => __('No album cover(s) were found', 'albumcoverfinder'),
        'tryagain'  => __('Try again', 'albumcoverfinder'),
        'savenow'   => __('Save post to change/remove featured image', 'albumcoverfinder'),
        'ajax_url'  => admin_url( 'admin-ajax.php' ),
        'uploadurl' => admin_url('media-upload.php')
    );

    wp_localize_script('albumcoverfinder-admin-script', 'AlbumCoverFinderParams', $js_data);

}

/**
 * Get attachment id from src
 * @param  [type] $image_src [description]
 * @return [type]            [description]
 */
public function get_attachment_id_from_src ($image_src) {
    global $wpdb;
    $query = "SELECT ID FROM {$wpdb->posts} WHERE guid='$image_src'";
    $id = $wpdb->get_var($query);
    return $id;
}

/**
 * Handle AJAX requests
 * @return [type] [description]
 */
public function xhr()  {

    if(isset($_POST['the_attachment']) && !empty($_POST['the_attachment']) && isset($_POST['the_post']) && !empty($_POST['the_post'])) :

        # Get variabels from Javascript
        $attachment_id = $_POST['the_attachment'];
        $post_id       = $_POST['the_post'];

        # Get array of attachments
        $attachment_array = wp_get_attachment_image_src( $attachment_id, 'medium');
        $attachment_img_url = $attachment_array[0];

        # Set post thumbnail
        set_post_thumbnail( $post_id, $attachment_id );

        # Send attachement url back to javascript
        echo $attachment_img_url;

        exit;

    endif;

    if(isset($_POST['detachattachment']) && !empty($_POST['detachattachment'])) :

        $attachment_id = $_POST['detachattachment'];

        # Detach (not delete) the attachment from the (any) post. Keeps it in the media library "unattached"
        # (We cant use wp_delete_attachment(); since it complete deletes the attachment file from media library)

        global $wpdb;

        $wpdb->get_results("UPDATE $wpdb->posts SET $wpdb->posts.post_parent = 0 WHERE $wpdb->posts.ID = $attachment_id");

        exit;

    endif;


    if(isset($_POST['setattachment']) && !empty($_POST['setattachment'])) :

        echo 'test';

        $image_url = $_POST['setattachment'];
        $post_id = $_POST['postid'];

        # Download image to media library
        $image = media_sideload_image($image_url, $post_id);

        # Strip out everything but src
        $image = preg_replace('/<img [^>]*src=[\'"]([^\'"]+)[\'"][^>]*>/','\\1',$image);

        # Get attachment id from image src
        $attachment_id = $this->get_attachment_id_from_src ($image);

        echo $attachment_id;

        exit;

    endif;

}

/**
 * Add meta boxes
 */
function add_search_boxes() {

    add_action( 'add_meta_boxes', 'albumcoverfinder_add_custom_box' );

    function albumcoverfinder_add_custom_box() {

        $post_types = array('post', 'page');

        foreach( $post_types as $post_type ) {
            add_meta_box(
                'lastfm_searcher_sectionid',
                __( 'Album cover finder', 'albumcoverfinder' ),
                'albumcoverfinder_metabox',
                $post_type,
                'side',
                'high'
                );
        }
    }

    function albumcoverfinder_metabox( $post ) {
        wp_nonce_field( plugin_basename( __FILE__ ), 'albumcoverfinder_metabox' );
        include('parts/metabox.php');
    }

}

}

$album_cover_finder = new AlbumCoverFinder();