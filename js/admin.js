(function ($) {
	"use strict";
	$(function () {

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
			var attachment_id = $(this).parent().parent().find('img').data('lfm_fileid'),
			post_id       = $('#pid').text();

			$.post(
				albumcoverfinder.ajaxurl,	{
					action: 'and_action',
					the_attachment: attachment_id,
					the_post: post_id,
				},	function(data) {

					// Build image for attaching to DOM
					var chosen_image = '<img width="100" height="100" src="'+data+'" class="attachment-post-thumbnail" style="display:block;">';
					var chosen_image_with_link = '<a title="Change featured image" href="'+albumcoverfinder.uploadurl+'?post_id='+post_id+'&amp;type=image&amp;TB_iframe=1&amp;width=640&amp;height=375" id="set-post-thumbnail" class="thickbox">'+chosen_image+'</a>';
					$('#postimagediv .inside').prepend(chosen_image_with_link);
					$('#postimagediv .inside p').hide();


				});

			e.preventDefault();

		});

		// Click event for inserting image directly from LastFM CDN in the post editor
		$('#insertineditor').on('click', function(e) {

			var insert_url = $('#theimgurl').text(),
			img_tag    = '<img src="'+insert_url+'">';

			// Switch to HTML-editor
			$('a.switch-html').trigger('click');
			// Append to WYSIWYG-text area
			$('.wp-editor-area').val($('.wp-editor-area').val()+img_tag);
			// Switch back to Tiny MCE
			$('a.switch-tmce').trigger('click');

			// $(this).attr("disabled", true);
			e.preventDefault();

		});

		$('#findalbum').on('click', function(e) {

			$('#wait').show();
			$('#findalbum').val(prefix_object_name.searching);

			var artist = $('#query_artist').val(),
			album      = $('#query_album').val(),
			size = $("input[type='range']").val();

			// Query Last FM
			findCover(artist, album, size);
			e.preventDefault();
		});

		$('#setattachment').on('click', function(e) {

			$('#wait').show();
			// Variables for sending via Ajax
			var att_count = $('.countattachments').text().substr(0,1),
			img_url = $('#theimgurl').text(),
			attachment_id = $(this).data('idnr'),
			pid = $('#pid').text();

			// Set number of attachments
			$('.countattachments').text(parseInt(att_count)+1+' '+prefix_object_name.files);

			// Ajax request, set post post thumbnail
			$.post(
				albumcoverfinder.ajaxurl,	{
					action: 'and_action',
					setattachment: img_url,
					postid: pid,
				},	function(data) {

						$('.lfm_attachments').prepend('<div class="lfm_file cf"><img data-lfm_fileid="'+data+'" src="'+img_url+'"><div class="lfm_text"><a class="setpostthumbnail button" value="'+prefix_object_name.set+'">'+prefix_object_name.set+'</a><a href="#" class="lfm_detach_attachment">'+prefix_object_name.remove+'</a></div></div>');
						$('#wait').hide();
				});

		});

		$('.lfm_viewattachments').on('click', function(e) {

			// View attached attachments
			if($(this).text() === prefix_object_name.view) {
				$('.lfm_attachments').slideDown(100);
				$(this).text(prefix_object_name.hide);
			} else {
				$('.lfm_attachments').slideUp(100);
				$(this).text(prefix_object_name.view);
			}
			e.preventDefault();

		});


		$(document).on( 'click', '.lfm_detach_attachment', function (e) {

			// Get attachment id from data attribute
			var attachment_id = $(this).parent().parent().find('img').data('lfm_fileid');

			// Remove in DOM
			$(this).parent().parent().slideUp( function() { $(this).remove(); });

			// Update number
			var att_count = $('.countattachments').text().substr(0,1);
			$('.countattachments').text(parseInt(att_count)-1+' '+prefix_object_name.files+'');

			// Ajax request, detach attachment from post
			$.post(
				albumcoverfinder.ajaxurl,	{
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
			acf_url            = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=853b3e9d9f565707e7edd6f878c3d587&artist='+encoded_artist+'&album='+encoded_album+'&format=json',
			html               = '';

			clearSearch();

			$.ajax({
				type:'GET',
				url: acf_url,
				success : function(data){
					// console.log(data.message);
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
						$('#findalbum').val(prefix_object_name.search);
						$('.clear').attr("disabled", false);

					} else {
						html += '<p>'+prefix_object_name.nofound+'</p>';
						$('#insertineditor').attr("disabled", true);
						$('#setattachment').attr("disabled", true);
						$('#findalbum').val(prefix_object_name.search);
					}
				},
				complete: function(){
					$('#cover').append(html).delay(200);
					$('#album_info').fadeIn(200);
					$('#cover img').eq(2).remove();
				},
				error : function(e,d,f){

				},
			});

		}

	});
}(jQuery));