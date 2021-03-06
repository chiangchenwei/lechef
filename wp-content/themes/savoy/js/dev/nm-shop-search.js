(function($) {	
	
	'use strict';
	
	// Extend core script
	$.extend($.nmTheme, {
		
		/**
		 *	Initialize scripts
		 */
		search_init: function() {
			var self = this,
				searchEnabled = ( self.$searchPanel.hasClass('nm-shop-search-ajax') ) ? true : false;
			
			/* Bind: Shop search */
			if (searchEnabled) {
				self.shopSearchBind();
			}
		},
		
		
		/**
		 *	Shop search: Bind
		 */
		shopSearchBind: function() {
			var self = this,
				$input, s, keyCode, validSearch;
			
			
			self.$searchInput = (self.searchInHeader) ? $('#nm-shop-search-input, #nm-mobile-menu-shop-search-input') : $('#nm-shop-search-input');
			
			self.searchAjax = null;
			self.currentSearch = '';
			
			
			/* Bind: Search input "keypress" event */
			self.$searchInput.keypress(function(event) {
				$input = $(this);
				s = $input.val();
				keyCode = (event.keyCode ? event.keyCode : event.which);
				
				if (keyCode == '13') {
					
					// Prevent default form submit on "Enter" keypress
					event.preventDefault();
				
					validSearch = self.shopSearchValidateInput(s);
					
					// Make sure search is valid and unique
					if (validSearch && self.currentSearch !== s) {
						
						if ($input.hasClass('nm-mobile-menu-search')) {
							// Close mobile menu
							self.$pageOverlay.trigger('click');
							setTimeout(function() {
								// Empty input value
								$('#nm-mobile-menu-shop-search-input').val('');
								self.shopSearch(s);
							}, self.panelsAnimSpeed);
						} else {
                            if (nm_wp_vars.shopSearchAutoClose != '0') {
                                // Close search-panel
                                self.$searchBtn.trigger('click');
                            } else {
                                // Hide search notice
                                self.$searchNotice.removeClass('show');
                            }
							
                            setTimeout(function() {
								self.shopSearch(s);
							}, self.filterPanelSlideSpeed);
						}
						
					} else {
						self.currentSearch = s;
					}
				}
			});
		},
		
		
		/**
		 *	Shop search: Perform search
		 */
		shopSearch: function(s) {
			var self = this;
			
			// Blur input to hide virtual mobile keyboards
			self.$searchInput.blur();
            
            if (self.shopSidebarLayout == 'popup') {
                 // Hide filters popup
                self.shopFiltersPopupHide();
            }
            
            // Show 'loader' overlay
            self.shopShowLoader();
			
			// Set current shop URL (used to reset search and product-tag AJAX results)
			//self.shopSetCurrentUrl(false); // Args: isProductTag
            
			self.currentSearch = s;
			
			self.searchAjax = $.ajax({
				url: nm_wp_vars.searchUrl + encodeURIComponent(s), // Note: Encoding the search string with "encodeURIComponent" to avoid breaking the AJAX url
				data: {
					shop_load: 'search',
					post_type: 'product',
                    shop_filters_layout: self.shopSidebarLayout
				},
				dataType: 'html',
				// Note: Disabling this to avoid the "_(random number)" query-string in pagination links
				//cache: false,
				//headers: {'cache-control': 'no-cache'},
				method: 'GET',
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					console.log('NM: AJAX error - shopSearch() - ' + errorThrown);
					
					// Hide 'loader' overlay
					self.shopHideLoader();
					
					self.searchAjax = null;
				},
				success: function(data) {
					// Update shop content
					self.shopUpdateContent(data);
					
					self.searchAjax = null;
				}
			});
		}
		
	});
	
	// Add extension so it can be called from $.nmThemeExtensions
	$.nmThemeExtensions.search = $.nmTheme.search_init;
	
})(jQuery);
