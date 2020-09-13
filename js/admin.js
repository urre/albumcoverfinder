(function ($) {

	"use strict";

	$(function () {

		// Update range slider
		$("input[type='range']").change(function() {
			var el = $(this);
			var size = el.prev();

			if(el.val() == 5) {
				size.html('Small');
			} else if(el.val() == 10) {
				size.html('Medium');
			} else if(el.val() == 15) {
				size.html('Large');
			}

		});

		// Disble clear button at first
		$('.clear').attr("disabled", true);

		// Clear search
		function clearSearch() {
			$('#album_info').hide();
			$('#cover').empty();
			$('#theimgurl').empty();
			$('.clear').attr("disabled", true);
			$('#query_artist').val('');
			$('#query_album').val('');
		}

		// Click event for the Clear button
		$(document).on( 'click', '.clear', function (e) {
			clearSearch();
		});

		// Click event for setting Post Thumbnail (featured image)
		$(document).on( 'click', '.setpostthumbnail', function (e) {

			// Empty featured image box before appending new image
			$('#postimagediv').find('img').remove();

			// Variables to send via Ajax
			var attachment_id = $(this).parent().parent().find('img').data('acoverfind_fileid'),
			post_id           = $('#pid').text();

			$.post(
				AlbumCoverFinderParams.ajax_url,	{
					action: 'and_action',
					the_attachment: attachment_id,
					the_post: post_id,
				},	function(data) {

					jQuery(".components-button.editor-post-featured-image__toggle" ).html('✅ Featured image set <br> update page!')

				});

			e.preventDefault();

		});

		// Click event for inserting image directly from LastFM CDN in the post editor
		$('#insertineditor').on('click', function(e) {

			var insert_url = $('#theimgurl').text(),
			img_tag    = '<img src="'+insert_url+'">';

			jQuery(img_tag).insertAfter( ".block-editor-block-list__layout.is-root-container p" );

			e.preventDefault();

		});

		$('#findalbum').on('click', function(e) {

			$('#wait').show();
			$('#findalbum').val(AlbumCoverFinderParams.searching);

			var artist = $('#query_artist').val(),
			album      = $('#query_album').val(),
			size = $("input[type='range']").val();

			// Query Last FM
			findCover(artist, album, size);
			e.preventDefault();
		});

		$('#setattachment').on('click', function(e) {

			$('#wait').show();

			var
			att_count     = $('.countattachments').text().substr(0,1),
			img_url       = $('#theimgurl').text(),
			attachment_id = $(this).data('idnr'),
			pid           = $('#pid').text();

			// Set number of attachments
			$('.countattachments').text(parseInt(att_count)+1+' '+AlbumCoverFinderParams.files);

			console.log(img_url);

			// Ajax request, set post post thumbnail
			$.post(
				AlbumCoverFinderParams.ajax_url,	{
					action: 'and_action',
					setattachment: img_url,
					postid: pid,
				},	function(data) {

					jQuery(".components-button.editor-post-featured-image__toggle" ).html('✅ Featured image set <br> update page!')

				});

		});

		$('.acoverfind_viewattachments').on('click', function(e) {

			// View attached attachments
			if($(this).text() === AlbumCoverFinderParams.view) {
				$('.acoverfind_attachments').show();
				$(this).text(AlbumCoverFinderParams.hide);
			} else {
				$('.acoverfind_attachments').hide();
				$(this).text(AlbumCoverFinderParams.view);
			}
			e.preventDefault();

		});

		$(document).on( 'click', '.acoverfind_insert_in_editor', function (e) {

			// Get image url
			var image_url = $(this).parent().parent().find('img').attr('src').replace('-150x150','');
			var img_tag    = '<img src="'+(image_url)+'">';

			jQuery(img_tag).insertAfter( ".block-editor-block-list__layout.is-root-container p" );

			e.preventDefault();

		});

		$(document).on( 'click', '.acoverfind_detach_attachment', function (e) {

			// Get attachment id from data attribute
			var attachment_id = $(this).parent().parent().find('img').data('acoverfind_fileid');

			// Remove in DOM
			$(this).parent().parent().slideUp( function() { $(this).remove(); });

			// Update number
			var att_count = $('.countattachments').text().substr(0,1);
			$('.countattachments').text(parseInt(att_count)-1+' '+AlbumCoverFinderParams.files+'');

			// Ajax request, detach attachment from post
			$.post(
				AlbumCoverFinderParams.ajax_url,	{
					action: 'and_action',
					detachattachment: attachment_id,
				},	function(data) {

				});

			e.preventDefault();

		});

		/**
		 * Search Last FM API
		 * API account is under the non-commercial license
		 * http://www.lastfm.se/api/tos
		 */

		function findCover(artist, album, thesize) {

			// Variables to send via Ajax
			var encoded_artist = encodeURIComponent(artist),
			encoded_album      = encodeURIComponent(album),
			lastfm_api_url     = 'https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=853b3e9d9f565707e7edd6f878c3d587&artist='+encoded_artist+'&album='+encoded_album+'&format=json',
			html               = '';

			clearSearch();

			$.ajax({
				type:'GET',
				url: lastfm_api_url,
				success : function(data){
					$('#wait').hide();
					if(data.message !== 'Artist not found' && data.message !== 'Album not found') {
						if(thesize == 15) {
							html += "<img src="+data.album.image[4]["#text"]+">";
							$('#theimgurl').text(data.album.image[4]["#text"]);
						} else if(thesize == 10) {
							html += "<img src="+data.album.image[3]["#text"]+">";
							$('#theimgurl').text(data.album.image[3]["#text"]);
						} else if(thesize == 10) {
							html += "<img src="+data.album.image[2]["#text"]+">";
							$('#theimgurl').text(data.album.image[2]["#text"]);
						}
						$('#setattachment').attr("disabled", false);
						$('#insertineditor').attr("disabled", false);
						$('#setposthtumbnail').attr("disabled", false);
						$('#findalbum').val(AlbumCoverFinderParams.search);
						$('.clear').attr("disabled", false);

					} else {
						html += '<p>'+AlbumCoverFinderParams.nofound+'</p>';
						$('#insertineditor').attr("disabled", true);
						$('#setattachment').attr("disabled", true);
						$('#findalbum').val(AlbumCoverFinderParams.search);
					}
				},
				complete: function(){
					$('#cover').append(html).delay(200);
					$('#album_info').fadeIn(200);
					$('#cover img').eq(2).remove();
					$('#findalbum').val(AlbumCoverFinderParams.search);
				},
				error : function(e,d,f){

				},
			});

		}

	});
}(jQuery));
