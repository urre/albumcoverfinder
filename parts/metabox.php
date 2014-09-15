<p><?php __('Search album covers', 'albumcoverfinder'); ?></p>

<form role="search">
	<input type="search" name="query_artist" id="query_artist" results="5" placeholder="<?php _e('Artist', 'albumcoverfinder'); ?>"/>
	<div id="wait"></div>
	<input type="search" name="query_album" id="query_album" results="5" placeholder="<?php _e('Album', 'albumcoverfinder'); ?>"/>
	<div class="sizes">
		<span>Large</span>
		<input type="range" name="points" min="5" max="15" step="5" value="15">
	</div>
	<input id="findalbum" class="button" type="submit" value="<?php _e('Search', 'albumcoverfinder'); ?>">
	<input class="button clear" type="button" value="<?php _e('Clear', 'albumcoverfinder'); ?>">
</form>

<div id="album_info">
	<div id="cover"></div>
	<a id="setattachment" class="button"><?php _e('Add as attachment', 'albumcoverfinder'); ?></a>
	<a id="insertineditor" class="button"><?php _e('Insert in editor', 'albumcoverfinder'); ?></a>
</div>

<?php
	# Count attachments
	$count = count(get_children(array('post_parent'=>$post->ID)));

	# Args for getting attachments
		$args = array(
		'post_type' => 'attachment',
		'numberposts' => null,
		'post_status' => null,
		'post_parent' => $post->ID
	);

	# Get the attachments
	$attachments = get_posts($args);

	echo '<p>'.__('Attachments', 'albumcoverfinder').'<a href="#" class="countattachments insert-media add_media" data-editor="content">'.$count.' '.__('files attached', 'albumcoverfinder').'</a>';
	echo '<a class="acoverfind_viewattachments button">'.__('View', 'albumcoverfinder').'</a></p>';
	echo '<div class="acoverfind_attachments">';

	# Show attachments if it exists any
	if ($attachments) :
		foreach ($attachments as $attachment) :
			$attachment_url = wp_get_attachment_image_src( $attachment->ID, 'thumbnail');
			$display_attachment_url = $attachment_url[0];

			echo '<div class="acoverfind_file cf">';
				echo '<img data-acoverfind_fileid="'.$attachment->ID.'" src="'.$display_attachment_url.'">';
					echo '<div class="acoverfind_text">';
						echo '<a class="setpostthumbnail button" value="'.__('Set featured image', 'albumcoverfinder').'">'.__('Set featured image', 'albumcoverfinder').'</a>';
						echo '<a href="#" class="acoverfind_detach_attachment">'.__('Remove attachment', 'albumcoverfinder').'</a>';
						echo '<a href="#" class="acoverfind_insert_in_editor">'.__('Insert in editor', 'albumcoverfinder').'</a>';
					echo '</div>';
			echo '</div>';
		endforeach;
	endif;

	echo '</div>';
?>

<div id="pid"><?php echo get_the_ID(); ?></div>
<div id="theimgurl"></div>