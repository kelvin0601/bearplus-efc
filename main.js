const script = () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    ScrollTrigger.defaults({
        invalidateOnRefresh: true
    });
    function autoRedirectByLocation() {
        const hasRedirected = sessionStorage.getItem('locationRedirected');
        if(hasRedirected) {
            console.log('Already redirected in this session');
            return;
        }
        
        const currentPath = window.location.pathname;
        const localeConfig = {
            default: { subdirectory: '' },
            uk: { subdirectory: '/uk', countries: ['GB', 'IE'] },
            apac: { subdirectory: '/apac', countries: ['AU', 'NZ'] }
        };
        
        const detectLocationByTimezone = () => {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log(timezone)
            // UK: GB, IE
            const ukTimezones = ['Europe/London', 'Europe/Dublin', 'Europe/Belfast'];
            if(ukTimezones.some(tz => timezone.includes(tz))) {
                return 'uk';
            }
            
            // APAC: AU, NZ
            const apacTimezones = ['Australia', 'Pacific/Auckland'];
            if(apacTimezones.some(tz => timezone.includes(tz))) {
                return 'apac';
            }
            
            return 'default';
        };
        
        const detectLocationByAPI = async () => {
            try {
                const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
                const data = await response.text();
                const lines = data.split('\n');
                const locLine = lines.find(line => line.startsWith('loc='));
                const countryCode = locLine ? locLine.split('=')[1] : null;
                
                if(!countryCode) {
                    return detectLocationByTimezone();
                }
                
                for(const [locale, config] of Object.entries(localeConfig)) {
                    if(config.countries.includes(countryCode)) {
                        return locale;
                    }
                }
                return 'default';
            } catch (error) {
                console.log('Cloudflare detection failed, using timezone fallback');
                return detectLocationByTimezone();
            }
        };
        
        const getCurrentLocale = () => {
            if(currentPath.startsWith('/uk')) return 'uk';
            if(currentPath.startsWith('/apac')) return 'apac';
            return 'default';
        };
        
        const redirectToLocale = (targetLocale) => {
            const currentLocale = getCurrentLocale();
            if(currentLocale === targetLocale) return;
            
            let basePath = currentPath;
            if(currentPath.startsWith('/uk')) {
                basePath = currentPath.replace('/uk', '');
            } else if(currentPath.startsWith('/apac')) {
                basePath = currentPath.replace('/apac', '');
            }
            
            const targetPath = localeConfig[targetLocale].subdirectory + (basePath || '/');
            
            sessionStorage.setItem('locationRedirected', 'true');
            
            console.log(`Redirecting from ${currentLocale} to ${targetLocale}: ${targetPath}`);
            window.location.href = targetPath;
        };
        
        // Detect và redirect
        detectLocationByAPI().then(detectedLocale => {
            redirectToLocale(detectedLocale);
        });
    }
    
    autoRedirectByLocation();
    function multiLineText(el){
        let line = $(el).next('.line-arr');
        let textMapLine = $(el).find('.bp-line');
        console.log(line)
        let lineClone = line.clone();
        console.log(lineClone)
        if(textMapLine.length >1){
            line.remove();
            textMapLine.each((idx, item) => {
              if(idx == 0){
                $(item).attr('data-cursor-txtLink-child','')
              }
                $(item).css({
                    position: 'relative',
                    width: 'max-content'
                  });
                $(item).append(lineClone.clone());
            })
        }
    }
    const reinitializeWebflow = (data) => {
		if (!window.Webflow) return;

		try {
			window.Webflow.destroy();
			window.Webflow.ready();
			const ix2 = window.Webflow.require("ix2");
			if (ix2 && typeof ix2.init === "function") {
				ix2.init();
			}
			const forms = window.Webflow.require("forms");
			if (forms && typeof forms.ready === "function") {
				forms.ready();
			}
			["slider", "tabs", "dropdown", "navbar"].forEach((module) => {
				try {
					const mod = window.Webflow.require(module);
					if (mod && typeof mod.ready === "function") {
						mod.ready();
					}
				} catch (e) {}
			});
			if (window.Webflow.redraw) {
				window.Webflow.redraw.up();
         }

         if (data) {
            let parser = new DOMParser();
            let dom = parser.parseFromString(data.next.html, "text/html");
            let webflowPageId = $(dom).find("html").attr("data-wf-page");
            $("html").attr("data-wf-page", webflowPageId);
         }
		} catch (e) {
			console.warn("Webflow reinit failed:", e);
		}
   };
    const cvUnit = (val, unit) => {
        let result;
        switch (true) {
            case unit === 'vw':
                result = window.innerWidth * (val / 100);
                break;
            case unit === 'vh':
                result = window.innerHeight * (val / 100);
                break;
            case unit === 'rem':
                result = val / 10 * parseFloat($('html').css('font-size'));
                break;
            default: break;
        }
        return result;
    }
    const viewport = {
		get w() {
			return window.innerWidth;
		},
		get h() {
			return window.innerHeight;
		},
    }
    const device = { desktop: 991, tablet: 767, mobile: 479 }
    function activeItem(elArr, index) {
        elArr.forEach((el, idx) => {
            $(el).removeClass('active').eq(index).addClass('active')
        })
    }
    const pointer = {
        x: $(window).width() / 2,
        y: $(window).height() / 2,
        xNor: $(window).width() / 2 / $(window).width(),
        yNor: $(window).height() / 2 / $(window).height(),
      };
      const xSetter = (el) => gsap.quickSetter(el, "x", `px`);
      const ySetter = (el) => gsap.quickSetter(el, "y", `px`);
      const xGetter = (el) => gsap.getProperty(el, "x");
      const yGetter = (el) => gsap.getProperty(el, "y");
      const lerp = (a, b, t = 0.08) => {
        return a + (b - a) * t;
      };
    const debounce = (func, timeout = 300) => {
        let timer

        return (...args) => {
            clearTimeout(timer)
            timer = setTimeout(() => { func.apply(this, args) }, timeout)
        }
    }
    const isInViewport = (el, orientation = 'vertical') => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (orientation == 'horizontal') {
                return (
                    rect.left <= (window.innerWidth) &&
                    rect.right >= 0
                );
        } else {
                return (
                    rect.top <= (window.innerHeight) &&
                    rect.bottom >= 0
                );
        }
    }
    const refreshOnBreakpoint = () => {
        const breakpoints = Object.values(device).sort((a, b) => a - b);
        const initialViewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const breakpoint = breakpoints.find(bp => initialViewportWidth < bp) || breakpoints[breakpoints.length - 1];
        window.addEventListener('resize', debounce(function () {
            const newViewportWidth = window.innerWidth || document.documentElement.clientWidth;
            if ((initialViewportWidth < breakpoint && newViewportWidth >= breakpoint) ||
                (initialViewportWidth >= breakpoint && newViewportWidth < breakpoint)) {
                location.reload();
            }
        }));
    }
    const documentHeightObserver = (() => {
        let previousHeight = document.documentElement.scrollHeight;
        let resizeObserver;
        let debounceTimer;

        function refreshScrollTrigger() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const currentHeight = document.documentElement.scrollHeight;

                if (currentHeight !== previousHeight) {
                    console.log("Document height changed. Refreshing ScrollTrigger...");
                    ScrollTrigger.refresh();
                    previousHeight = currentHeight;
                }
            }, 200); // Adjust the debounce delay as needed
        }

        return (action) => {
            if (action === "init") {
                console.log("Initializing document height observer...");
                resizeObserver = new ResizeObserver(refreshScrollTrigger);
                resizeObserver.observe(document.documentElement);
            }
            else if (action === "disconnect") {
                console.log("Disconnecting document height observer...");
                if (resizeObserver) {
                    resizeObserver.disconnect();
                }
            }
        };
    })();
    const getAllScrollTrigger = (fn) => {
        let triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
            if (fn === "refresh") {
                if (trigger.progress === 0) {
                    trigger[fn]?.();
                }
            } else {
                trigger[fn]?.();
            }
        });
    };
    function resetScroll() {
        if (window.location.hash !== '') {
            if ($(window.location.hash).length >= 1) {
                $("html").animate({ scrollTop: $(window.location.hash).offset().top - 100 }, 1200);

                setTimeout(() => {
                    $("html").animate({ scrollTop: $(window.location.hash).offset().top - 100 }, 1200);
                }, 300);
            } else {
                scrollTop()
            }
        } else if (window.location.search !== '') {
            let searchObj = JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
            if (searchObj.sc) {
                if ($(`#${searchObj.sc}`).length >= 1) {
                    let target = `#${searchObj.sc}`;
                    setTimeout(() => {
                        smoothScroll.scrollTo(`#${searchObj.sc}`, {
                            offset: -100
                        })
                    }, 500);
                } else {
                    scrollTop()
                }
            }
        } else {
            scrollTop()
        }
    };
    const shareLink = () => {
        const currentUrl = window.location.href;
        const pageTitle = document.title;
        
        // Share Facebook
        $('[data-share="facebook"]').on('click', function(e) {
            e.preventDefault();
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
            window.open(facebookUrl, '_blank', 'width=600,height=400');
        });
        
        // Share LinkedIn
        $('[data-share="linkedin"]').on('click', function(e) {
            e.preventDefault();
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
            window.open(linkedinUrl, '_blank', 'width=600,height=400');
        });
        
        // Copy Link
        $('[data-share="copy"]').on('click', function(e) {
            e.preventDefault();
            navigator.clipboard.writeText(currentUrl).then(() => {
                // Hiển thị thông báo đã copy
                let $btn = $(this).find('.copy-tooltip');
                $btn.addClass('active');
                setTimeout(() => {
                    $btn.removeClass('active');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }
    const isTouchDevice = () => {
        return (
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0
        );
      };
    if (!isTouchDevice()) {
    $("html").attr("data-has-cursor", "true");
    window.addEventListener("pointermove", function (e) {
        updatePointer(e);
    });
    } else {
    $("html").attr("data-has-cursor", "false");
    window.addEventListener("pointerdown", function (e) {
        updatePointer(e);
    });
    }
    function updatePointer(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.xNor = (e.clientX / $(window).width() - 0.5) * 2;
    pointer.yNor = (e.clientY / $(window).height() - 0.5) * 2;
    if (cursor.userMoved != true && viewport.w >= 992) {
        cursor.userMoved = true;
        cursor.init();
    }
    }
    class Marquee {
        constructor(list, item, duration = 40, direction) {
           this.list = list;
           this.item = item;
           this.duration = duration;
           this.direction = direction || 'left';
        }
        setup() {
           let itemWidth = this.item.width();
           const windowWidth = $(window).width();
           console.log(itemWidth, windowWidth);
           if (!itemWidth || itemWidth <= 0 || !windowWidth || windowWidth <= 0) {
              return;
           }
           const cloneAmount = Math.ceil(windowWidth / itemWidth) + 1;
           if (!Number.isFinite(cloneAmount) || cloneAmount <= 0 || cloneAmount > 1000) {
              return;
           }
  
           let itemClone = this.item.clone();
           this.list.html('');
           new Array(cloneAmount).fill().forEach(() => {
              let html = itemClone.clone()
              html.css('animation-duration', `${Math.ceil(itemWidth / this.duration)}s`);
              if(this.direction == 'left') {
                 html.addClass('marquee-left');
              } else {
                 html.addClass('marquee-right');
              }
              this.list.append(html);
           });
        }
        play() {
           if(this.direction == 'left') {
              $(this.list).find('.marquee-left').addClass('anim');
           } else {
              $(this.list).find('.marquee-right').addClass('anim');
           }
        }
    }
    class Loading {
        constructor() {}
        isDoneLoading() {
          return true;
        }
      }
    let load = new Loading();
    class Cursor {
    constructor() {
        this.targetX = pointer.x;
        this.targetY = pointer.y;
        this.userMoved = false;
        xSetter(".cursor-main")(this.targetX);
        ySetter(".cursor-main")(this.targetY);
    }
    init() {
        requestAnimationFrame(this.update.bind(this));
        $(".cursor-main .cursor-inner").addClass("active");
    }
    isUserMoved() {
        return this.userMoved;
    }
    update() {
        if (this.userMoved || load.isDoneLoading()) {
        this.updatePosition();
        }
        requestAnimationFrame(this.update.bind(this));
    }
    updateHtml () {
        $('[data-cursor="bg"]').each((idx, el) => {
            let bg = '--cl-' + ($(el).attr('data-bg')  || 'white')
            $(el).find('.txt, .heading').css({
                'position': 'relative',
                'z-index': '2'
            })
            $(el).find('.ic-embed:not(.ic-arr-main):not(.ic-arr-clone)').css({
                'position': 'relative',
                'z-index': '2'
            })
            let btnDot = $(document.createElement('div')).addClass('bg-dot');
            let btnDotInner = $(document.createElement('div')).addClass('bg-dot-inner').css('background-color', `var(${bg})`);
            btnDot.append(btnDotInner)
            $(el).append(btnDot)
        })
    }
    updatePosition() {
        this.targetX = pointer.x;
        this.targetY = pointer.y;
        let targetInnerX = xGetter(".cursor-main");
        let targetInnerY = yGetter(".cursor-main");

        if ($("[data-cursor]:hover").length) {
        this.onHover();
        } else {
        this.reset();
        }

        if (
        Math.hypot(this.targetX - targetInnerX, this.targetY - targetInnerY) >
            1 ||
        Math.abs(smoothScroll.lenis.velocity) > 0.1
        ) {
        xSetter(".cursor-main")(lerp(targetInnerX, this.targetX, 0.1));
        ySetter(".cursor-main")(
            lerp(targetInnerY, this.targetY - smoothScroll.lenis.velocity / 16, 0.1)
        );
        }
        ['blue', 'black'].forEach(color => {
        const inSectionColor = $(`[data-section="${color}"]`).toArray().some(el => this.isMouseInSection(el));
        if(inSectionColor) {
            $('.cursor-inner').addClass(`on-${color}`);
        } else {
            $('.cursor-inner').removeClass(`on-${color}`);
        }
        });
        if ($('[data-cursor="drag"]:hover').length) {
        const midX = viewport.w / 2;
        let controlPrev = $('[data-cursor="drag"]:hover').attr('data-control-prev');
        let controlNext = $('[data-cursor="drag"]:hover').attr('data-control-next');
        if (pointer.x > midX) {
            // Bên phải -> prev
            $(".cursor").removeClass("left").addClass("right");
            if ($(`.${controlNext}`).hasClass("swiper-button-disabled")) {
            $(".cursor").addClass("disabled");
            } else {
            $(".cursor").removeClass("disabled");
            }
        } else {
            // Bên trái -> next
            $(".cursor").removeClass("right").addClass("left");
        
            if ($(`.${controlPrev}`).hasClass("swiper-button-disabled")) {
            $(".cursor").addClass("disabled");
            } else {
            $(".cursor").removeClass("disabled");
            }
        }
        } else {
        $(".cursor").removeClass("left right disabled");
        }      
    }
    isMouseInSection(el) {
        const rect = el.getBoundingClientRect();
        return (
        pointer.x >= rect.left &&
        pointer.x <= rect.right &&
        pointer.y >= rect.top &&
        pointer.y <= rect.bottom
        );
    }
    
    onHover() {
        let type = $("[data-cursor]:hover").attr("data-cursor");
        let gotBtnSize = false;
        if ($("[data-cursor]:hover").length && type != 'hidden') {
            $('.cursor').addClass('on-hover');
        switch (type) {
            case "hidden":
                $(".cursor").addClass("on-hover-hidden");
                break;
            case 'bg':
                $('.cursor').addClass('on-hover-hidden');
                let targetBg;
                targetBg = $('[data-cursor="bg"]:hover')
                this.targetX = targetBg.get(0).getBoundingClientRect().left + targetBg.get(0).getBoundingClientRect().width / 2;
                this.targetY = targetBg.get(0).getBoundingClientRect().top + targetBg.get(0).getBoundingClientRect().height / 2;
                let bgDotX, bgDotY;
                if (!gotBtnSize) {
                    if ($('[data-cursor]:hover').hasClass('home-ser-item-btn')) {
                        gsap.set('html', {'--cursor-width': targetBg.get(0).getBoundingClientRect().width + cvUnit(130, 'rem'), '--cursor-height': targetBg.get(0).getBoundingClientRect().height + cvUnit(130, 'rem')})
                    } else if ($('[data-cursor]:hover').hasClass('sm-menu')) {  
                        gsap.set('html', {'--cursor-width': targetBg.get(0).getBoundingClientRect().width * 1.6, '--cursor-height': targetBg.get(0).getBoundingClientRect().height * 1.3})
                    } else {
                        gsap.set('html', {'--cursor-width': targetBg.get(0).getBoundingClientRect().width*1.4, '--cursor-height': targetBg.get(0).getBoundingClientRect().height*1.4})
                    }

                    bgDotX = (pointer.x - targetBg.get(0).getBoundingClientRect().left)
                    bgDotY = (pointer.y - targetBg.get(0).getBoundingClientRect().top)
                    xSetter('[data-cursor]:hover .bg-dot')(lerp(bgDotX, (pointer.x - targetBg.get(0).getBoundingClientRect().left)), .12)
                    ySetter('[data-cursor]:hover .bg-dot')(lerp(bgDotY, (pointer.y - targetBg.get(0).getBoundingClientRect().top)), .12)
                    gotBtnSize = true
                } else {
                    bgDotX = xGetter('[data-cursor]:hover .bg-dot')
                    bgDotY = yGetter('[data-cursor]:hover .bg-dot')
                    xSetter('[data-cursor]:hover .bg-dot')(lerp(bgDotX, (pointer.x - targetBg.get(0).getBoundingClientRect().left)), .12)
                    ySetter('[data-cursor]:hover .bg-dot')(lerp(bgDotY, (pointer.y - targetBg.get(0).getBoundingClientRect().top)), .12)
                }

                break;
            case "txtLink":
                $(".cursor-inner").addClass("on-hover-sm");
                let targetEl;
                if (
                    $("[data-cursor]:hover").attr("data-cursor-txtLink") == "parent"
                ) {
                    targetEl = $("[data-cursor]:hover").parent();
                } else if (
                    $("[data-cursor]:hover").attr("data-cursor-txtLink") == "child"
                ) {
                    targetEl = $("[data-cursor]:hover").find(
                    "[data-cursor-txtLink-child]"
                    );
                } else {
                    targetEl = $("[data-cursor]:hover");
                }

                let targetGap = cvUnit(8, 'rem');
                this.targetX =
                targetEl.get(0).getBoundingClientRect().left;
                $('[data-cursor]:hover .txt').css('transform', `translateX(${targetGap + $(".cursor-inner.on-hover-sm").width()}px)`)
                this.targetY =
                    targetEl.get(0).getBoundingClientRect().top +
                    targetEl.get(0).getBoundingClientRect().height / 2;
                break;
            default:
                break;
        }
        } else {
            $('.cursor').removeClass('on-hover');
            gotBtnSize = false;
        }
    }
    reset() {
        $(".cursor").removeClass("on-hover-hidden");
        $('.cursor').removeClass('on-hover');
        $('[data-cursor] .txt').css('transform', 'translateX(0px)')
    }
    }
    let cursor = new Cursor();
    function scrollTop(onComplete) {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        smoothScroll.scrollToTop({
            onComplete: () => {
                onComplete?.();
                getAllScrollTrigger("refresh");
            }
        });
    }
    class SmoothScroll {
		constructor() {
			this.lenis = null;
			this.scroller = {
				scrollX: window.scrollX,
				scrollY: window.scrollY,
				velocity: 0,
				direction: 0,
			};
			this.lastScroller = {
				scrollX: window.scrollX,
				scrollY: window.scrollY,
				velocity: 0,
				direction: 0,
			};
		}

		init() {
			this.reInit();

			$.easing.lenisEase = function (t) {
				return Math.min(1, 1.001 - Math.pow(2, -10 * t));
			};

			gsap.ticker.add((time) => {
				if (this.lenis) {
					this.lenis.raf(time * 1000);
				}
			});
			gsap.ticker.lagSmoothing(0);
		}

		reInit() {
			if (this.lenis) {
				this.lenis.destroy();
			}
			this.lenis = new Lenis();
			this.lenis.on("scroll", (e) => {
				this.updateOnScroll(e);
				ScrollTrigger.update();
			});
		}
		reachedThreshold(threshold) {
			if (!threshold) return false;
			const dist = distance(
				this.scroller.scrollX,
				this.scroller.scrollY,
				this.lastScroller.scrollX,
				this.lastScroller.scrollY
			);

			if (dist > threshold) {
				this.lastScroller = { ...this.scroller };
				return true;
			}
			return false;
		}

		updateOnScroll(e) {
			this.scroller.scrollX = e.scroll;
			this.scroller.scrollY = e.scroll;
			this.scroller.velocity = e.velocity;
            this.scroller.direction = e.direction;
            if (header) {
                header.updateOnScroll(this.lenis);
            }
		}

		start() {
			if (this.lenis) {
				this.lenis.start();
			}
			$(".body").css("overflow", "initial");
		}

		stop() {
			if (this.lenis) {
				this.lenis.stop();
			}
			$(".body").css("overflow", "hidden");
		}

		scrollTo(target, options = {}) {
			if (this.lenis) {
				this.lenis.scrollTo(target, options);
			}
		}

		scrollToTop(options = {}) {
            if (this.lenis) {
                this.lenis.scrollTo("top", { duration: .0001, immediate: true, lock: true, ...options });
            }
		}

		destroy() {
			if (this.lenis) {
				gsap.ticker.remove((time) => {
					this.lenis.raf(time * 1000);
				});
				this.lenis.destroy();
				this.lenis = null;
			}
		}
	}
	const smoothScroll = new SmoothScroll();
    smoothScroll.init();
    
    class TriggerSetup extends HTMLElement {
        constructor() {
            super();
            this.tlTrigger = null;
            this.onTrigger = () => { };
        }
        connectedCallback() {
            this.tlTrigger = gsap.timeline({
                scrollTrigger: {
                    trigger: $(this).find('section'),
                    start: 'top bottom+=50%',
                    end: 'bottom top-=50%',
                    once: true,
                    onEnter: () => {
                        this.onTrigger?.();
                    }
                }
            });
        }
        destroy() {
            if (this.tlTrigger) {
                this.tlTrigger.kill();
                this.tlTrigger = null;
            }
        }
    }
    const formSubmitEvent = (function () {
        const init = ({
           onlyWorkOnThisFormName,
           onSuccess,
           onFail
        }) => {
           let inputSubmit = $(`#${getIDFormName(onlyWorkOnThisFormName)} button[type="submit"] .txt`);
  
           $(document).on('ajaxSend', function (event, xhr, settings) {
              if (settings.url.includes("https://webflow.com/api/v1/form/")) {
                    inputSubmit?.text('Please wait...');
              }
           });
           $(document).on('ajaxComplete', function (event, xhr, settings) {
              if (settings.url.includes("https://webflow.com/api/v1/form/")) {
                    const isSuccessful = xhr.status === 200
                    const isWorkOnAllForm = onlyWorkOnThisFormName == undefined
                    const isCorrectForm = !isWorkOnAllForm && settings.data.includes(getSanitizedFormName(onlyWorkOnThisFormName));
  
                    if (isWorkOnAllForm) {
                       if (isSuccessful) {
                          onSuccess?.()
                          inputSubmit?.text('Submit');
                       } else {
                          onFail?.()
                       }
                    } else if (isCorrectForm) {
                       if (isSuccessful) {
                          onSuccess?.()
                          inputSubmit?.text('Submit');
                       } else {
                          onFail?.()
                       }
                    }
              }
           });
        }
        function getIDFormName(name) {
           return name.toLowerCase().replaceAll(" ", "-");
        }
        function getSanitizedFormName(name) {
           return name.replaceAll(" ", "+")
        }
        return {
           init
        }
     })();
     function setupLocationRedirect() {
        let lang = $('html').attr('lang');
        let CurrentPathUrl = window.location.pathname;
        switch(lang) {
            case 'en':
                let urlRedirectToHome = ['/summit', '/efc-vs-white-belt', '/efc-vs-mind-body']
                urlRedirectToHome.forEach(url => {
                    if(CurrentPathUrl.includes(url)) {
                        window.location.href = '/';
                        return;
                    }
                });
                break;
            case 'en-AU':
                let urlRedirectToHomeAU = [ '/efc-vs-gymdesk', '/efc-vs-zen-planner']
                urlRedirectToHomeAU.forEach(url => {
                    if(CurrentPathUrl.includes(url)) {
                        window.location.href = '/apac';
                        return;
                    }
                });
                break;
            case 'en-GB':
                let urlRedirectToHomeGB = [ '/efc-vs-gymdesk', '/efc-vs-zen-planner', '/efc-vs-white-belt', '/efc-vs-mind-body']
                urlRedirectToHomeGB.forEach(url => {
                    if(CurrentPathUrl.includes(url)) {
                        window.location.href = '/uk';
                        return;
                    }
                });
                break;
        }
     }
     setupLocationRedirect();
    class Header {
        constructor() {
            this.el = null;
            this.isOpen = false;
            this.listDependent = [];
        }
        init(data) {
            this.el = document.querySelector('.header');
            this.setupLocaleLinks();
            this.animationReveal();
            if (viewport.w <= 991) {
                this.interact();
            }
        }
        animationReveal() {
            // gsap.to('.header-inner', {autoAlpha: 1,y: 0, duration: .6, ease: 'power2.inOut'})
        }
        updateOnScroll(inst) {
            this.toggleHide(inst);
            this.toggleScroll(inst);
            this.onHideDependent(inst);
        }
        onHideDependent() {
            let heightHeader = $(this.el).outerHeight();
            if(!$(this.el).hasClass('on-hide')) {
               this.listDependent.forEach((item) => {
                  $(item).css('top', heightHeader);
               });
            } else {
               this.listDependent.forEach((item) => {
                  $(item).css('top', 0);
               });
            }
        }
        registerDependent(dependentEl) {
        this.listDependent.push(dependentEl);
        }
        unregisterDependent(dependentEl) {
        if (this.listDependent.includes(dependentEl)) {
            this.listDependent = this.listDependent.filter((item) => item !== dependentEl);
        }
        }
        toggleScroll(inst) {
            if (inst.scroll > cvUnit(44, 'rem')) $(this.el).addClass("on-scroll");
            else $(this.el).removeClass("on-scroll");
        }
        toggleHide(inst) {
            if (inst.direction == 1) {
                if (inst.scroll > ($(this.el).height() * 3)) {
                    $(this.el).addClass('on-hide');
                }
            } else if (inst.direction == -1) {
                if (inst.scroll > ($(this.el).height() * 3)) {
                    $(this.el).addClass("on-hide");
                    $(this.el).removeClass("on-hide");
                }
            }
            else {
                $(this.el).removeClass("on-hide");
            }
        }
        setupLocaleLinks() {
            const currentPath = window.location.pathname;
            const localeConfig = [
                { subdirectory: '', index: 0 },
                { subdirectory: '/uk', index: 1 },
                { subdirectory: '/apac', index: 2 }
            ];
            
            let basePath = currentPath;
            let currentLocaleIndex = 0;
            
            localeConfig.forEach((config, index) => {
                if (config.subdirectory && (currentPath.startsWith(config.subdirectory + '/') || currentPath === config.subdirectory)) {
                    basePath = currentPath.replace(config.subdirectory, '') || '/';
                    currentLocaleIndex = index;
                }
            });
            
            $('.header-lang-dropdown-inner .header-lang-item').removeClass('active');
            
            localeConfig.forEach(config => {
                const newPath = config.subdirectory ? config.subdirectory + basePath : basePath;
                const $item = $('.header-lang-dropdown-inner .header-lang-item').eq(config.index);
                
                if ($item.length) {
                    $item.attr('href', newPath);
                }
                
                if (config.index === currentLocaleIndex) {
                    $item.addClass('active');
                    let text = $item.find('.txt').text();
                    $('.header-lang-txt .txt').text(text);
                    $('.header-lang-ic img').attr('src', $item.find('img').attr('src'));
                }
            });
        }
        interact() {
            if(viewport.w <= 991) {
                $(this.el).find('.header-toggle').on('click', (e)=>{
                    e.preventDefault();
                    $(e.currentTarget).toggleClass('active');
                    $(this.el).find('.header-menu').toggleClass('active');
                });
                $(window).on('click', (e) => {
                    if (!$(e.target).closest('.header-toggle').length && !$(e.target).closest('.header-menu').length) {
                    $(this.el).find('.header-toggle').removeClass('active');
                    $(this.el).find('.header-menu').removeClass('active');
                    }
                });
                $('.header-menu-item-wrap.parent').on('click','.header-menu-item', (e)=>{
                    e.preventDefault();
                    $(e.currentTarget).closest('.header-menu-item-wrap').toggleClass('active');
                    $(e.currentTarget).closest('.header-menu-item-wrap').find('.header-menu-sub-wrap').slideToggle();
                });
                $('.header-lang').on('click', (e)=>{
                    e.preventDefault();
                    $(e.currentTarget).closest('.header-lang-wrap').find('.header-lang-dropdown').toggleClass('active');
                    $(e.currentTarget).toggleClass('active');
                });
                $(window).on('click', (e) => {
                    if (!$(e.target).closest('.header-lang-wrap').length) {
                        $(e.currentTarget).removeClass('active');
                        $(this.el).find('.header-lang-dropdown').removeClass('active');
                    }
                });
            }
        }
    }
    const header = new Header();
    header.init();
    class Footer {
        constructor() {
            this.el = null;
        }
        init() {
            this.el = document.querySelector('.footer');
            this.animationReveal();
            this.validateEmail();
            this.handleSubmit();
        }
        animationReveal() {
            // get current year 
            const currentYear = new Date().getFullYear();
            $('.txt-year-current').text(currentYear);
        }
        validateEmail() {
            const $input = $('.footer-form-input');
            const $submitBtn = $('.footer-form-btn, .footer form [type="submit"]');
            
            if($input.length === 0) return;
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            $input.on('input', function() {
                const email = $(this).val().trim();
                
                if(emailRegex.test(email)) {
                    $submitBtn.addClass('active');
                } else {
                    $submitBtn.removeClass('active');
                }
            });
        }
        handleSubmit() {
            const $form = $('.footer form');
            if($form.length === 0) return;
            
            $form.on('submit', (e) => {
                e.preventDefault();
                
                const $input = $('.footer-form-input');
                const email = $input.val().trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if(emailRegex.test(email)) {
                    this.submitHubspot(email);
                }
            });
        }
        submitHubspot(email) {
            const hubspot = {
                portalId: 530303,
                formId: "1c950273-f9a4-4c0f-8d02-30db7d834225",
                fields: [
                    { name: "email", value: email }
                ],
            };
            
            const currentLocale = $('html').attr('lang');
            if(currentLocale == 'en-GB') {
                hubspot.formId = "f52180a2-350e-4dd9-b180-73f2b394dcb7";
            }
            else if(currentLocale == 'en-AU') {
                hubspot.formId = "f9e6eafa-041f-4a90-9802-c7f5d04732e4";
            }
            
            const { portalId, formId, fields } = hubspot;
            let url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
            
            const dataSend = {
                fields: fields.map(field => ({
                    name: field.name,
                    value: field.value
                })),
                context: {
                    pageUri: window.location.href,
                    pageName: "Footer Newsletter",
                },
            };
            
            $.ajax({
                url: url,
                method: "POST",
                data: JSON.stringify(dataSend),
                dataType: "json",
                headers: {
                    accept: "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                contentType: "application/json",
                success: (response) => {
                    console.log('Newsletter subscription successful:', response);
                    $('.footer-form-input').val('');
                    $('.footer-form-btn, .footer form [type="submit"]').removeClass('active');
                    $('.footer-form-message').addClass('active');
                    setTimeout(() => {
                        $('.footer-form-message').removeClass('active');
                    }, 3000);
                },
                error: (xhr, resp, text) => {
                    console.error('Newsletter subscription failed:', xhr, resp, text);
                    alert('Something went wrong. Please try again.');
                },
            });
        }
    }
    const footer = new Footer();
    footer.init();
    function mapFormToObject(ele) {
        const formData = new FormData(ele);
        const result = {};
        
        for(const [name, val] of formData.entries()) {
            result[name] = val;
        }
        
        $(ele).find('input[type="checkbox"]').each(function() {
            const name = $(this).attr('name');
            if(name) {
                result[name] = this.checked;
            }
        });
        
        return result;
     }

    const HomePage = {
        "home-partner-wrap": class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                const pathMaps = $('.path-map');
                
                if(pathMaps.length === 0) return;
                
                const tl = gsap.timeline({
                    repeat: -1,
                    repeatDelay: 0,
                    scrollTrigger: {
                        trigger: '.home-partner-wrap',
                        start: 'top bottom-=20%',
                        once: true
                    }
                });
                
                pathMaps.each((index, path) => {
                    const totalLength = path.getTotalLength();
                    gsap.set(path, {
                        strokeDasharray: totalLength,
                        strokeDashoffset: totalLength
                    });
                });
                
                const animatePath = (indices) => {
                    const expandLabel = `expand-${indices.join('-')}`;
                    
                    indices.forEach(index => {
                        const path = pathMaps[index];
                        const totalLength = path.getTotalLength();
                        
                        tl.to(path, {
                            strokeDashoffset: 0,
                            duration: .8,
                            ease: 'power2.inOut'
                        }, expandLabel);
                    });
                    
                    indices.forEach(index => {
                        const path = pathMaps[index];
                        const totalLength = path.getTotalLength();
                        
                        tl.to(path, {
                            strokeDashoffset: -totalLength,
                            duration: .8,
                            ease: 'power2.inOut',
                            onComplete: () => {
                                gsap.set(path, { strokeDashoffset: totalLength });
                            }
                        }, `${expandLabel}+=1.5`);
                    });
                };
                
                animatePath([0, 1]);
                tl.addLabel('delay1', '-=0.1');
                animatePath([2, 3]);
            }
        },
        'home-product-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.currentIndex = -1;
                this.items = $('.home-product-item');
                this.mainTrigger = null;
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if(this.items.length > 0 && viewport.w > 992) {
                    this.setupScrollTriggers();
                }
                if(viewport.w <= 992) {
                    this.toggleItem(0);
                    $('.home-product-img-item').each(function(index, item) {
                        let list = $(item).find('.home-product-img-thumb-list').clone();
                        console.log(list);
                        $('.home-product-item').eq(index).find('.home-product-item-video').append(list);
                    });
                    let marquee = new Marquee($('.home-product-item:first-child .home-product-item-video'), $('.home-product-item:first-child .home-product-img-thumb-list'), 120);
                    marquee.setup();
                    marquee.play();
                }
                else {
                    activeItem(['.home-product-item', '.home-product-img-item'], 0);
                    $('.home-product-item').eq(0).find('.home-product-item-content').slideDown();
                }
            }
            setupScrollTriggers() {
                if(this.mainTrigger) {
                    this.mainTrigger.kill();
                }
                
                this.items.removeClass('active');
                $('.home-product-img-item').removeClass('active');
                gsap.set('.home-product-item-line-progress', { x: '-101%' });
                
                let itemCount = this.items.length;
                
                this.mainTrigger = ScrollTrigger.create({
                    trigger: '.home-product-wrap',
                    start: 'top+=30% center',
                    end: 'bottom-=20% center',
                    scrub: 0.5,
                    onUpdate: (self) => {
                        let progress = self.progress;
                        let newIndex = Math.floor(progress * itemCount);
                        
                        newIndex = Math.min(Math.max(0, newIndex), itemCount - 1);
                        
                        if(newIndex !== this.currentIndex) {
                            this.currentIndex = newIndex;
                            this.activateItem(newIndex);
                        }
                        
                        let itemStartProgress = this.currentIndex / itemCount;
                        let itemEndProgress = (this.currentIndex + 1) / itemCount;
                        let itemProgress = (progress - itemStartProgress) / (itemEndProgress - itemStartProgress);
                        itemProgress = Math.max(0, Math.min(1, itemProgress));
                        
                        if(itemProgress >= 0 && itemProgress <= 1) {
                            this.updateProgressBar(this.currentIndex, itemProgress);
                        }
                    }
                });
            }
            activateItem(index) {
                this.items.removeClass('active');
                $('.home-product-img-item').removeClass('active');
                gsap.set('.home-product-item-line-progress', { x: '-101%' });
                
                $(this.items[index]).addClass('active');
                $('.home-product-img-item').eq(index).addClass('active');
                
                $('.home-product-item-content').each(function(idx, item) {
                    if(idx === index) {
                        $(item).slideDown();
                    } else {
                        // gsap.to(this, {
                        //     height: 0,
                        //     opacity: 0,
                        //     duration: 0.3,
                        //     ease: 'power2.in',
                        //     onComplete: () => {
                        //         $(this).css('display', 'none');
                        //     }
                        // });
                        $(item).slideUp();
                    }
                });
            }
            updateProgressBar(index, progress) {
                let progressBar = $(this.items[index]).find('.home-product-item-line-progress');
                if(progressBar.length > 0) {
                    console.log(progress);
                    let xPos = -101 + (progress * 101);
                    gsap.set(progressBar[0], { x: xPos + '%' });
                }
                
                if(index === 0) {
                    const thumbContainer = $('.home-product-img-item').eq(index).find('.home-product-img-thumb');
                    const thumbList = thumbContainer.find('.home-product-img-thumb-list');
                    
                    if(thumbList.length > 0 && thumbContainer.length > 0) {
                        const containerWidth = thumbContainer.outerWidth();
                        const listWidth = thumbList.outerWidth();
                        const maxTranslate = listWidth - containerWidth;
                        
                        if(maxTranslate > 0) {
                            const translateX = -(progress * maxTranslate);
                            gsap.set(thumbList[0], { x: translateX + 'px' });
                        }
                    }
                }
            }
            toggleItem(index) {
                if($(this.items[index]).hasClass('active')) {
                    $(this.items[index]).removeClass('active');
                    $(this.items[index]).find('.home-product-item-content').slideUp(300);
                }
                else {
                    $(this.items).removeClass('active');
                    $(this.items[index]).addClass('active');
                    $('.home-product-item-content').slideUp(300);
                    $(this.items[index]).find('.home-product-item-content').slideDown(300);
                }
            }
            interact() {
                if(viewport.w > 992) {
                    this.items.each((index, item) => {
                        $(item).find('.home-product-item-head').on('click', (e) => {
                            this.scrollToItem(index);
                        });
                    });
                } else {
                    this.items.each((index, item) => {
                        $(item).find('.home-product-item-head').on('click', (e) => {
                            this.toggleItem(index);
                        });
                    });
                }
                
                $('.home-product-img-item-cta-link').on('click', (e) => {
                    e.preventDefault();
                    let href = $(e.currentTarget).attr('href');
                    $(".popup-video-inner iframe").attr('src', href);
                    $(".popup-video").addClass('active');
                });
                $('.popup-video-close').on('click', (e) => {
                    e.preventDefault();
                    $(".popup-video").removeClass('active');
                    $(".popup-video-inner iframe").attr('src', '');
                });
            }
            scrollToItem(index) {
                if(!this.mainTrigger) return;
                
                const itemCount = this.items.length;
                const targetProgress = (index + 0.02) / itemCount;
                
                const scrollStart = this.mainTrigger.start;
                const scrollEnd = this.mainTrigger.end;
                const scrollDistance = scrollEnd - scrollStart;
                const targetScroll = scrollStart + (scrollDistance * targetProgress);
                
                if(smoothScroll && smoothScroll.lenis) {
                    smoothScroll.scrollTo(targetScroll, {
                        duration: 1,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                } else {
                    window.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                }
            }
            destroy() {
                if(this.mainTrigger) {
                    this.mainTrigger.kill();
                    this.mainTrigger = null;
                }
                super.destroy();
            }
        },
        'home-trans-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 767) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                };
            }
            animationReveal() {
            }
            initSwiper() {
                $('.home-trans-inner').addClass('swiper');
                $('.home-trans-main-wrap').addClass('swiper-wrapper');
                $('.home-trans-main').addClass('swiper-slide');
                const swiper = new Swiper('.home-trans-inner', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(0, 'rem'),
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'home-trust-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                if($('.home-trust-logo-item').length == 0){
                    $('.home-trust').hide();
                    return;
                }
                 let marquee = new Marquee($('.home-trust-logo-main'), $('.home-trust-logo-list'), 40);
                 marquee.setup();
                 marquee.play();
            }
        },
        'stories-support-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                // let swiper = new Swiper('.stories-support-cms.swiper', {
                //     slidesPerView: 'auto',
                //     spaceBetween: cvUnit(20, 'rem'),
                //     speed: 12000,
                //     loop: true,
                //     autoplay: {
                //         delay: 0,
                //         disableOnInteraction: true,
                //     },
                //     loopAdditionalSlides: 1,
                //     pagination: {
                //         el: '.stories-support-pagi',
                //         bulletClass: 'stories-support-pagi-item',
                //         bulletActiveClass: 'active',
                //         clickable: true,  
                //     },
                //     breakpoints: {
                //         991: {
                //             slidesPerView: 2,
                //         }
                //     }
                // });
                
                // let originalSpeed = swiper.params.speed;
                
                // $('.stories-support-cms.swiper').on('mouseenter', function() {
                //     if(swiper.autoplay) {
                //         swiper.params.speed = 600;
                //         swiper.autoplay.stop();
                //         setTimeout(() => {
                //             swiper.setTranslate(swiper.getTranslate());
                //         }, 0);
                //     }
                // });
                
                // $('.stories-support-cms.swiper').on('mouseleave', function() {
                //     if(swiper.autoplay) {
                //         swiper.params.speed = originalSpeed;
                //         swiper.autoplay.start();
                //     }
                // });
                if(viewport.w > 992) {
                    let marquee = new Marquee($('.stories-support-cms'), $('.stories-support-list'), 120);
                    marquee.setup();
                    marquee.play();
                }
                else {
                    $('.stories-support-cms').addClass('swiper');
                    $('.stories-support-list').addClass('swiper-wrapper');
                    $('.stories-support-item').addClass('swiper-slide');
                    $('.stories-support-cms').css('grid-column-gap', 0);
                    const swiper = new Swiper('.stories-support-cms', {
                        slidesPerView: 'auto',
                        spaceBetween: cvUnit(20, 'rem'),
                        pagination: {
                            el: '.stories-support-pagi',
                            bulletClass: 'stories-support-pagi-item',
                            bulletActiveClass: 'active',
                            clickable: true,
                        }
                    });
                }
            }
            animationScrub() {
            }
            interact() {
                $('.stories-support-item-link').on('click', (e) => {
                    console.log('click');
                    e.preventDefault();
                    let link = $(e.target).closest('.stories-support-item-link').attr('href');
                    $('.popup-video-iframe').attr('src', link);
                    $('.popup-video').addClass('active');
                    smoothScroll.stop();
                });
                $('.popup-video-close').on('click', () => {
                    $('.popup-video-iframe').attr('src', '');
                    $('.popup-video').removeClass('active');
                    smoothScroll.start();
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'home-testi-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                let swiper = new Swiper('.home-testi-cms.swiper', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(20, 'rem'),
                    navigation: {
                        nextEl: '.home-testi-control-item.item-next',
                        prevEl: '.home-testi-control-item.item-prev',
                    },
                    pagination: {
                        el: '.home-testi-pagi',
                        bulletClass: 'home-testi-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,  
                      },
                    breakpoints: {
                        991: {
                            slidesPerView: 2,
                        }
                    },
                });
            }
            animationScrub() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'home-pricing-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            animationScrub() {
            }
            interact() {
            }
            initSwiper() {
                $('.pricing-plan-cms').addClass('swiper');
                $('.home-pricing-head-list').addClass('swiper-wrapper');
                $('.home-pricing-head-item').addClass('swiper-slide');
                const swiper = new Swiper('.home-pricing-head-cms', {
                    slidesPerView: 1,
                    spaceBetween: cvUnit(0, 'rem'),
                    pagination: {
                        el: '.home-pricing-pagi',
                        bulletClass: 'home-pricing-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,
                    },
                    breakpoints: {
                        768: {
                            slidesPerView: 'auto',
                        }
                    },
                    on: {
                        slideChange: (swiper) => {
                            let indexActive = swiper.activeIndex;
                            $('.home-pricing-content').each((_, item) => {
                                $(item).find('.home-pricing-content-item').removeClass('active');
                                $(item).find('.home-pricing-content-item').eq(indexActive).addClass('active');
                            });
                        }
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'home-resource-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.home-resource-cms').addClass('swiper');
                $('.home-resource-list').addClass('swiper-wrapper');
                $('.home-resource-item').addClass('swiper-slide');
                const swiper = new Swiper('.home-resource-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.home-resource-pagi',
                        bulletClass: 'home-resource-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,
                    },
                });
            }
            animationScrub() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'faq-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                $('.faq-item-sub').hide();
                // this.activeFaqItem($(this).find('.faq-item').eq(0));
                $('.faq-item').on('click', (e) => {
                    e.preventDefault();
                    this.activeFaqItem(e.currentTarget);
                });
            }
            activeFaqItem(item) {
                const $item = $(item);
                const $itemSub = $item.find('.faq-item-sub');
                const isActive = $item.hasClass('active');
                
                if (isActive) {
                    $item.removeClass('active');
                    $itemSub.slideUp();
                } else {
                    $('.faq-item').removeClass('active');
                    $('.faq-item-sub').slideUp();
                    $item.addClass('active');
                    $itemSub.slideDown();
                }
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const FaqPage = {
        'faq-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
            }
            animationScrub() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'faq-main-wrap': class extends TriggerSetup {
            constructor() {
                super();
                // Cache DOM elements
                this.$els = {};
                this.searchIndex = -1;
                this.searchTimeout = null;
                this.SCROLL_OFFSET = -100;
                this.DEBOUNCE_DELAY = 150;
                
                this.onTrigger = () => {
                    this.cacheElements();
                    this.animationReveal();
                    this.interact();
                    this.checkScrollTo();
                };
            }
            
            cacheElements() {
                this.$els = {
                    tabInner: $('.faq-main-tab-inner'),
                    tabMain: $('.faq-main-tab-main'),
                    categorySticky: $('.faq-main-category-sticky'),
                    categoryStickyInner: $('.faq-main-category-sticky-inner'),
                    categoryStickyIc: $('.faq-main-category-sticky-ic .embed-ic'),
                    categoryStickyTitle: $('.faq-main-category-sticky-title .txt'),
                    categoryItems: $('.faq-main-category-item'),
                    viewItemTitles: $('.faq-main-view-item-title h2'),
                    searchInput: $('#faq-search'),
                    searchForm: $('#form-faq-search'),
                    searchDropdown: $('.faq-hero-form-dropdown'),
                    dropdownInner: $('.faq-hero-form-dropdown-inner'),
                    dropdownEmpty: $('.faq-hero-form-dropdown-empty'),
                    itemHeads: $('.faq-main-item-head'),
                    relatesLinks: $('.faq-main-item-relates-item-link')
                };
            }
            
            animationReveal() {
                this.updateUICateNew();
                if(viewport.w <= 991) {
                    header.registerDependent(this.$els.categorySticky);
                }
                const topInit = (viewport.h - this.$els.tabInner.outerHeight()) / 2;
                console.log($('.faq-main-category-cms.custom-scroll .faq-main-category-list').height(), $('.faq-main-category-cms.custom-scroll').height());
                if($('.faq-main-category-cms.custom-scroll .faq-main-category-list').height() > $('.faq-main-category-cms.custom-scroll').height()) {
                    console.log('prevent');
                    $('.faq-main-category-cms').attr('data-lenis-prevent', 'true');
                }
                this.$els.tabInner.css('top', topInit + 'px');
                this.initContent();
                this.searchFaqOnType();
            }
            
            checkScrollTo() {
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                const category = urlParams.get('category');
                
                if(id) {
                    const $target = $(`#${id}`);
                    if(!$target.length) return;
                    
                    const $head = $target.find('.faq-main-item-head');
                    if (!$head.hasClass('active')) {
                        $head.trigger('click');
                    }
                    this.scrollToFaq(id);
                    return;
                }
                
                if(category) {
                    const $categoryItem = $(`.faq-main-category-item[data-category-slug="${category}"]`);
                    this.$els.categoryItems.removeClass('active');
                    $categoryItem.addClass('active');
                    
                    const dataTitle = $categoryItem.attr('data-title');
                    const content = $(`.faq-main-view-item-title h2[data-title="${dataTitle}"]`)[0];
                    if(content) {
                        smoothScroll.scrollTo(content, {
                            offset: this.SCROLL_OFFSET,
                            duration: 1,
                        });
                    }
                }
            }
            
            scrollToFaq(faqId) {
                const $target = $(`#${faqId}`);
                if(!$target.length) return;
                
                const scrollOffset = (viewport.h - $target.outerHeight()) / 2;
                smoothScroll.scrollTo(`#${faqId}`, {offset: -scrollOffset});
            }
            
            getUrl(id = '', category = '') {
                const url = new URL(window.location.href);
                
                if(id) {
                    url.searchParams.set('id', id);
                    if(!category) {
                        const $target = $(`#${id}`);
                        if($target.length) {
                            const categoryTitle = $target.closest('.faq-main-view-item')
                                .find('.faq-main-view-item-title .heading')
                                .attr('data-title');
                            if(categoryTitle) {
                                const categorySlug = $(`.faq-main-category-item[data-title="${categoryTitle}"]`)
                                    .attr('data-category-slug');
                                if(categorySlug) {
                                    url.searchParams.set('category', categorySlug);
                                }
                            }
                        }
                    }
                } else {
                    url.searchParams.delete('id');
                }
                
                if(category) {
                    url.searchParams.set('category', category);
                }
                
                return url.toString();
            }
            
            initContent() {
                // Batch DOM updates
                this.$els.viewItemTitles.each((idx, item) => {
                    item.setAttribute('data-title', 'toch-' + idx);
                });
                
                $('.faq-main-category-cms').each((idx, itemCate) => {
                    $(itemCate).find('.faq-main-category-item').each((idx, item) => {
                        item.setAttribute('data-title', 'toch-' + idx);
                    });
                });
            }
            
            updateUICateNew() {
                const $firstItem = $('.faq-hero-form-dropdown-item').eq(0);
                if(!$firstItem.length) return;
                
                const itemTemplate = $firstItem.clone();
                const fragment = document.createDocumentFragment();
                
                $('.faq-main-view-item').each((idx, faq) => {
                    $(faq).find('.faq-main-item').each((idx, item) => {
                        const $item = $(item);
                        const newItem = itemTemplate.clone();
                        const dataScroll = $item.find('.faq-main-item-inner').attr('id');
                        const title = $item.find('.faq-main-item-title .txt').text();
                        
                        newItem.attr('data-scrollto', dataScroll);
                        newItem.find('.fs-16').text(title);
                        fragment.appendChild(newItem[0]);
                    });
                });
                
                this.$els.dropdownInner.empty().append(fragment);
            }
            
            debounce(func, delay) {
                return (...args) => {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => func.apply(this, args), delay);
                };
            }
            
            filterSearchResults(value) {
                if(!value) return;
                
                const compValue = value.toLowerCase().replace(/[\s-]/g, '');
                const regex = new RegExp("(" + value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ")", "gi");
                const $items = $('.faq-hero-form-dropdown-item');
                
                $items.each((idx, el) => {
                    const $el = $(el);
                    const $textEl = $el.find('.fs-16');
                    const originalText = $textEl.text();
                    const compText = originalText.toLowerCase().replace(/[\s-]/g, '');
                    
                    if (compText.includes(compValue)) {
                        $el.removeClass('hidden');
                        const highlightedText = originalText.replace(regex, "<span class='hl'>$1</span>");
                        $textEl.html(highlightedText);
                    } else {
                        $el.addClass('hidden');
                    }
                });
                
                this.updateDropdownUI();
            }
            
            updateDropdownUI() {
                const innerHeight = this.$els.dropdownInner.height();
                const dropdownHeight = this.$els.searchDropdown.outerHeight();
                
                if (innerHeight === 0) {
                    this.$els.dropdownEmpty.slideDown();
                } else {
                    this.$els.dropdownEmpty.slideUp();
                }
                
                if(innerHeight > dropdownHeight) {
                    this.$els.searchDropdown.attr('data-lenis-prevent', 'true');
                } else {
                    this.$els.searchDropdown.removeAttr('data-lenis-prevent');
                }
            }
            
            handleSearchKeyboard(e, $itemsActive) {
                switch (e.key) {
                    case 'Tab':
                    case 'ArrowDown':
                        e.preventDefault();
                        this.searchIndex = (this.searchIndex + 1) % $itemsActive.length;
                        this.setActiveSearchItem($itemsActive);
                        break;
                    
                    case 'ArrowUp':
                        e.preventDefault();
                        this.searchIndex = (this.searchIndex - 1 + $itemsActive.length) % $itemsActive.length;
                        this.setActiveSearchItem($itemsActive);
                        break;
                    
                    case 'Enter':
                        e.preventDefault();
                        // Nếu chưa chọn item nào (searchIndex = -1), auto-select item đầu tiên
                        if (this.searchIndex < 0 && $itemsActive.length > 0) {
                            this.searchIndex = 0;
                        }
                        // Select item nếu có item được chọn
                        if (this.searchIndex >= 0 && $itemsActive.length > 0) {
                            this.selectSearchItem($itemsActive.eq(this.searchIndex));
                        }
                        break;
                    
                    case 'Escape':
                        this.$els.searchDropdown.removeClass('open');
                        break;
                }
            }
            
            setActiveSearchItem($items) {
                $items.removeClass('active');
                if(this.searchIndex >= 0 && this.searchIndex < $items.length) {
                    const $activeItem = $items.eq(this.searchIndex);
                    $activeItem.addClass('active');
                    
                    const activeEl = $activeItem[0];
                    if (activeEl) {
                        // scroll cộng thêm .4rem
                        activeEl.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }
                }
            }
            
            selectSearchItem($item) {
                const faqId = $item.attr('data-scrollto');
                if(!faqId) return;
                
                const $target = $(`#${faqId}`);
                if(!$target.length) return;
                
                const $head = $target.find('.faq-main-item-head');
                if (!$head.hasClass('active')) {
                    $head.trigger('click');
                }
                
                this.scrollToFaq(faqId);
                window.history.pushState({}, '', this.getUrl(faqId));
                setTimeout(() => {
                    this.$els.searchDropdown.removeClass('open');
                }, 100);
            }
            
            searchFaqOnType() {
                this.$els.searchForm.attr('action', '').on('submit', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                const debouncedFilter = this.debounce((value) => {
                    this.filterSearchResults(value);
                }, this.DEBOUNCE_DELAY);
                
                this.$els.searchInput.on('keyup', (e) => {
                    e.preventDefault();
                    const value = this.$els.searchInput.val();
                    
                    // Chỉ handle keyboard navigation cho các phím điều hướng và Enter
                    if(['Tab', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
                        const $itemsActive = this.$els.searchDropdown.find('.faq-hero-form-dropdown-item:not(.hidden)');
                        this.handleSearchKeyboard(e, $itemsActive);
                    } else {
                        // User đang gõ text → reset search index và filter
                        $('.faq-hero-form-dropdown-item').removeClass('active');
                        this.searchIndex = -1;
                        debouncedFilter(value);
                    }
                    
                    // Toggle dropdown
                    if (value !== '') {
                        this.$els.searchDropdown.addClass('open');
                    } else {
                        this.$els.searchDropdown.removeClass('open');
                    }
                });
                
                // Handle input changes (paste, etc.) - không reset searchIndex
                this.$els.searchInput.on('input', (e) => {
                    const value = this.$els.searchInput.val();
                    $('.faq-hero-form-dropdown-item').removeClass('active');
                    this.searchIndex = -1;
                    debouncedFilter(value);
                    
                    // Toggle dropdown
                    if (value !== '') {
                        this.$els.searchDropdown.addClass('open');
                    } else {
                        this.$els.searchDropdown.removeClass('open');
                    }
                });
                
                this.$els.searchInput.on('focus', () => {
                    this.$els.categoryStickyInner.removeClass('active');
                    if (this.$els.searchInput.val() !== '') {
                        this.$els.searchDropdown.addClass('open');
                    }
                });
                
                this.$els.searchInput.on('blur', () => {
                    if (!this.$els.searchDropdown.is(':hover')) {
                        this.$els.searchDropdown.removeClass('open');
                    }
                });
                
                // Use event delegation
                this.$els.searchDropdown.on('click', '.faq-hero-form-dropdown-item', (e) => {
                    e.preventDefault();
                    this.selectSearchItem($(e.currentTarget));
                });
            }
            
            updateMobileCategoryUI($currentTarget) {
                if(viewport.w > 991) return;
                
                const $itemIc = $currentTarget.find('.faq-main-category-item-ic .w-embed');
                const $itemTitle = $currentTarget.find('.faq-main-category-item-title .txt').eq(0);
                this.$els.categoryStickyIc.html($itemIc.html());
                this.$els.categoryStickyTitle.text($itemTitle.eq(0).text());
            }
            
            interact() {
                if(viewport.w <= 991) {
                    this.$els.categoryStickyInner.on('click', (e) => {
                        e.preventDefault();
                        $(e.currentTarget).toggleClass('active');
                    });
                }
                
                this.$els.categoryItems.on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    
                    this.updateMobileCategoryUI($current);
                    this.$els.categoryItems.removeClass('active');
                    $current.addClass('active');
                    this.$els.categoryStickyInner.removeClass('active');
                    
                    const dataTitle = $current.attr('data-title');
                    const content = $(`.faq-main-view-item-title h2[data-title="${dataTitle}"]`)[0];
                    
                    if(content) {
                        smoothScroll.scrollTo(content, {
                            offset: this.SCROLL_OFFSET,
                            duration: 1,
                        });
                    }
                    
                    const slug = $current.attr('data-category-slug');
                    window.history.pushState({}, '', this.getUrl('', slug));
                });
                
                // Throttled scroll handler
                let scrollTicking = false;
                smoothScroll.lenis.on('scroll', () => {
                    if(!scrollTicking) {
                        window.requestAnimationFrame(() => {
                            this.itemContentActiveCheck();
                            scrollTicking = false;
                        });
                        scrollTicking = true;
                    }
                });
                
                this.$els.itemHeads.on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    const $item = $current.closest('.faq-main-item');
                    const $content = $item.find('.faq-main-item-content');
                    
                    if (!$current.hasClass('active')) {
                        this.$els.itemHeads.removeClass('active');
                        $('.faq-main-item-content').slideUp();
                        $current.addClass('active');
                        $content.slideDown();
                    } else {
                        $current.removeClass('active');
                        $content.slideUp();
                    }
                    
                    const id = $current.closest('.faq-main-item-inner').attr('id');
                    window.history.pushState({}, '', this.getUrl(id));
                });
                
                this.$els.relatesLinks.on('click', (e) => {
                    e.preventDefault();
                    const scrollTo = $(e.currentTarget).attr('data-scrollto');
                    
                    const $target = $(`#${scrollTo}`);
                    if(!$target.length) return;
                    
                    const $head = $target.find('.faq-main-item-head');
                    if (!$head.hasClass('active')) {
                        $head.trigger('click');
                    }
                    
                    this.scrollToFaq(scrollTo);
                    window.history.pushState({}, '', this.getUrl(scrollTo));
                });
            }
            
            itemContentActiveCheck() {
                const viewportHeight = $(window).height();
                const halfHeight = viewportHeight / 2;
                
                this.$els.viewItemTitles.each((i, el) => {
                    const rect = el.getBoundingClientRect();
                    const dataTitle = el.getAttribute('data-title');
                    
                    if (rect.top > 0 && rect.top - $(el).height() < halfHeight) {
                        const $categoryItem = $(`.faq-main-category-item[data-title="${dataTitle}"]`);
                        
                        this.$els.categoryItems.removeClass('active');
                        $categoryItem.addClass('active');
                        
                        if(viewport.w <= 991 && $categoryItem.length) {
                            this.updateMobileCategoryUI($categoryItem);
                        }
                    }
                });
            }
            
            destroy() {
                // Cleanup event handlers
                if(this.$els.searchInput) {
                    this.$els.searchInput.off();
                    this.$els.searchForm.off();
                    this.$els.searchDropdown.off();
                }
                if(this.$els.categoryItems) {
                    this.$els.categoryItems.off();
                    this.$els.categoryStickyInner.off();
                    this.$els.itemHeads.off();
                    this.$els.relatesLinks.off();
                }
                clearTimeout(this.searchTimeout);
                super.destroy();
            }
        }
    }
    const SchedulePage = {
        'schedule-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'schedule-benefit-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                }
            }
            animationReveal() {
                console.log('test', viewport.w);
                if(viewport.w < 768) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.schedule-benefit-cms').addClass('swiper');
                $('.schedule-benefit-item').addClass('swiper-slide');
                $('.schedule-benefit-list').addClass('swiper-wrapper');
                let swiper = new Swiper('.schedule-benefit-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.schedule-benefit-pagi',
                        bulletClass: 'schedule-benefit-pagi-item',
                        bulletActiveClass: 'active'
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const ContactPage = {
        'contact-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                
            }
            animationScrub() {
            }
            interact() {
                const $formSuccess = $('.schedule-form-success');
                const $inputGr = $('.schedule-hero-form-input-gr');
                const $selectWrap = $('.schedule-hero-form-select-wrap');
                const $selectDropdown = $('.schedule-hero-form-select-dropdown');
                
                const formReset = (form) => {
                    $(form)[0].reset();
                    reinitializeWebflow();
                    $('.schedule-hero-form-option-input-wrap').slideUp();
                    $inputGr.removeClass('active');
                    $('.input:not(.input-hidden)').closest('.schedule-hero-form-input-gr').removeClass('filled');
                    $selectWrap.removeClass('filled open');
                    $('.schedule-hero-form-select-inner .txt').text('Select');
                }
                
                const onSuccessForm = (form) => {
                    console.log('success');
                    $formSuccess.addClass('active');
                    formReset(form);
                    setTimeout(() => {
                        $formSuccess.removeClass('active');
                    }, 5000);
                }
                
                $('.schedule-form-success-btn').on('click', (e) => {
                    e.preventDefault();
                    $formSuccess.removeClass('active');
                });
                
                formSubmitEvent.init({
                    onlyWorkOnThisFormName: "Contact Form",
                    onSuccess: () => onSuccessForm("#contact-form form"),
                });
                
                $('input[type="checkbox"]').on('change', (e) => {
                    const $current = $(e.currentTarget);
                    const $inputWrap = $current.closest('.schedule-hero-form-option-item')
                        .find('.schedule-hero-form-option-input-wrap');
                    $inputWrap[$current.is(':checked') ? 'slideDown' : 'slideUp']();
                });
                
                $('.schedule-hero-form-input').on('focus', (e) => {
                    $(e.currentTarget).closest('.schedule-hero-form-input-gr').addClass('active');
                });
                
                $('.schedule-hero-form-input').on('blur', (e) => {
                    const $current = $(e.currentTarget);
                    const $parent = $current.closest('.schedule-hero-form-input-gr').length 
                        ? $current.closest('.schedule-hero-form-input-gr') 
                        : $current.closest('.schedule-hero-form-option-input-inner');
                    
                    $parent.removeClass('active')
                        .toggleClass('filled', !!$current.val());
                });
                
                $('.schedule-hero-form-select-inner').on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    const $parent = $current.closest('.schedule-hero-form-select-wrap');
                    const $dropdown = $parent.find('.schedule-hero-form-select-dropdown');
                    
                    $selectWrap.not($parent).removeClass('open');
                    $selectDropdown.not($dropdown).removeClass('active');
                    
                    if($current.closest('.schedule-hero-form-input-gr').hasClass('active')) {
                        $current.closest('.schedule-hero-form-input-gr').removeClass('active');
                    }
                    else {
                        $('.schedule-hero-form-input-gr').removeClass('active');
                        $current.closest('.schedule-hero-form-input-gr').addClass('active');
                    }
                    $parent.toggleClass('active open');
                    $dropdown.toggleClass('active');
                });
                
                $(document).on('click', (e) => {
                    if (!$(e.target).closest('.schedule-hero-form-select-wrap').length) {
                        $selectWrap.removeClass('open');
                        if($(e.target).closest('.schedule-hero-form-input').length) {
                            $inputGr.removeClass('active');
                            $(e.target).closest('.schedule-hero-form-input-gr').addClass('active');
                        }
                        else {
                            $inputGr.removeClass('active');
                        }
                        $selectDropdown.removeClass('active');
                    }
                });
                
                $('.schedule-hero-form-select-dropdown-item').on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    const text = $current.find('.txt').text();
                    const $parent = $current.closest('.schedule-hero-form-select-wrap');
                    const $selectInner = $parent.find('.schedule-hero-form-select-inner');
                    
                    $inputGr.removeClass('active');
                    $parent.addClass('filled').removeClass('open');
                    $parent.find('.schedule-hero-form-select-dropdown').removeClass('active');
                    $selectInner.find('.txt').text(text);
                    $selectInner.find('input').val(text);
                    
                    $('.schedule-hero-form-select-dropdown-item').removeClass('active');
                    $current.addClass('active');
                });
                
                $('.schedule-hero-form-submit').on('click', (e) => {
                    if (!this.checkFormValid()) {
                        e.preventDefault();
                    }
                    else {
                        this.submitHubspot();
                    }
                });
                
                $('button[type="submit"]').on("pointerenter", function () {
                    $(this).prop("disabled", false);
                });
            }
            checkEmailValid(emailValue) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(emailRegex.test(emailValue)) {
                    return true;
                } else {
                    return false;
                }
            }
            checkFormValid() {
                const messageEmail = "Invalid email";
                const email = $('input[name="Email"]');
                const firstName = $('input[name="First-Name"]');
                const lastName = $('input[name="Last-Name"]');
                const challenge = $('input[name="Challenge"]');
                const location = $('input[name="Location"]');
                let isValid = true;
                if(location.length > 0){
                    if(!location.val()) {
                        location.closest('.schedule-hero-form-input-gr').addClass('error');
                        isValid = false;
                    }
                    else {
                        location.closest('.schedule-hero-form-input-gr').removeClass('error');
                    }
                }
                if(!firstName.val()) {
                    firstName.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    firstName.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!lastName.val()) {
                    lastName.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    lastName.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!email.val()) {
                    email.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else if(!this.checkEmailValid(email.val())) {
                    email.closest('.schedule-hero-form-input-gr').find('.schedule-hero-form-valid .txt').text(messageEmail);
                    email.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    email.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!challenge.val()) {
                    challenge.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    challenge.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                console.log(isValid);
                return isValid;
            }
            submitHubspot() {
                const hubspot = {
                    portalId: 530303,
                    formId: "09af315b-85df-4065-88b4-21d1d7a56f89",
                    fields: [
                        { name: "firstname", value: (data) => data["First-Name"] },
                        { name: "lastname", value: (data) => data["Last-Name"] },
                        { name: "email", value: (data) => data["Email"] },
                        { name: "what_can_we_help_you_with", value: (data) => data["Challenge"] },
                        { name: "message", value: (data) => data["Message"] },
                        { name: "LEGAL_CONSENT.subscription_type_1997065850", value: (data) => data["wants_marketing_emails"] }
                    ],
                };
                if($('input[name="Location"]').length > 0) {
                    hubspot.fields.push({ name: "location", value: (data) => data["Location"] });
                }
                //get current locale
                const currentLocale = $('html').attr('lang');
                if(currentLocale == 'en-GB') { //uk
                    hubspot.formId = "ce557112-f014-4189-b3ca-ad1cc02691bb";
                }
                else if(currentLocale == 'en-AU') { //apac
                    hubspot.formId = "e3e25e1f-9a2f-4d25-9d08-caf691c8c5db";
                }
                const { portalId, formId, fields } = hubspot;
                let url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
                const data = mapFormToObject($('#contact-form form').get(0));
                const mapField = (data) => {
                   if (!fields.length) return [];
    
                   const result = fields.map((field) => {
                      const { name, value } = field;
                      if (!value) {
                      return {
                         name,
                         value: data[name] || "",
                      };
                      } else {
                      const getValue = value(data);
                      return {
                         name,
                         value: getValue || "",
                      };
                      }
                   });
                   return result;
                };
                const mappedFields = mapField(data);
                const dataSend = {
                   fields: mappedFields,
                   context: {
                      pageUri: window.location.href,
                      pageName: "Contact page",
                   },
                };
                $.ajax({
                   url: url,
                   method: "POST",
                   data: JSON.stringify(dataSend),
                   dataType: "json",
                   headers: {
                      accept: "application/json",
                      "Access-Control-Allow-Origin": "*",
                   },
                   contentType: "application/json",
                   success: function (response) {
                      console.log(response);
                   },
                   error: function (xhr, resp, text) {
                      console.log(xhr, resp, text);
                   },
                });
             }
            destroy() {
                super.destroy();
            }
        },
        'contact-benefit-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                }
            }
            animationReveal() {
                console.log('test', viewport.w);
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.contact-benefit-cms').addClass('swiper');
                $('.contact-benefit-item').addClass('swiper-slide');
                $('.contact-benefit-list').addClass('swiper-wrapper');
                let swiper = new Swiper('.contact-benefit-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.contact-benefit-pagi',
                        bulletClass: 'contact-benefit-pagi-item',
                        bulletActiveClass: 'active'
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const GrowthPage = {
        'growth-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 767) {
                    this.initSwiper();
                }
                if($('.growth-articles-item').length == 0) {
                    $('.growth-articles').hide();
                }
                if($('.growth-guide-item').length == 0) {
                    $('.growth-guide').hide();
                }
                if($('.growth-training-item').length == 0) {
                    $('.growth-training').hide();
                }
                if($('.growth-event-item').length == 0) {
                    $('.growth-event').hide();
                }
            }
            animationScrub() {
            }   
            initSwiper() {
                $('.growth-hero-category-wrap').addClass('swiper');
                $('.growth-hero-category-item').addClass('swiper-slide');
                $('.growth-hero-category').addClass('swiper-wrapper');
                let swiper = new Swiper('.growth-hero-category-wrap', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(4, 'rem')
                });
            }
            interact() {
                $('.growth-hero-form-inner').on('submit', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    let value = $(this).find('.growth-hero-input').val();
                    if(!value) {
                        return false;
                    }
                    else {
                        let href ='/result?search=' + value;
                        window.location.href = href;
                    }
                });
                $(window).on('scroll', () => {
                    let heroBottom = $('.growth-hero').offset().top + $('.growth-hero').outerHeight();
                    let scrollTop = $(window).scrollTop();
                    let stickySearch = $('.growth-hub-search-sticky');
                    let footer = $('.footer');
                    
                    if(scrollTop > heroBottom) {
                        console.log('active');
                        stickySearch.addClass('active');
                    } else {
                        stickySearch.removeClass('active');
                    }
                    
                    // Remove class active when bottom chạm .footer
                    if(footer.length && stickySearch.length) {
                        let footerTop = footer.offset().top;
                        let stickyBottom = scrollTop + viewport.h;
                        
                        if(stickyBottom >= footerTop) {
                            stickySearch.removeClass('active');
                        }
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'growth-articles-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            animationScrub() {
            }   
            initSwiper() {
                $('.growth-articles-cms').addClass('swiper');
                $('.growth-articles-item').addClass('swiper-slide');
                $('.growth-articles-list').addClass('swiper-wrapper');
                let swiper = new Swiper('.growth-articles-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(20, 'rem'),
                    pagination: {
                        el: '.growth-articles-pagi',
                        bulletClass: 'growth-articles-pagi-item',
                        bulletActiveClass: 'active'
                    }
                });
            }
            interact() {

            }
            destroy() {
                super.destroy();
            }
        },
        'growth-guide-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            animationScrub() {
            }   
            initSwiper() {
                $('.growth-guide-cms').addClass('swiper');
                $('.growth-guide-item').addClass('swiper-slide');
                $('.growth-guide-list').addClass('swiper-wrapper');
                let swiper = new Swiper('.growth-guide-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(20, 'rem'),
                    pagination: {
                        el: '.growth-guide-pagi',
                        bulletClass: 'growth-guide-pagi-item',
                        bulletActiveClass: 'active'
                    }
                });
            }
            interact() {

            }
            destroy() {
                super.destroy();
            }
        },
        'growth-training-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            animationScrub() {
            }   
            initSwiper() {
                $('.growth-training-cms').addClass('swiper');
                $('.growth-training-item').addClass('swiper-slide');
                $('.growth-training-list').addClass('swiper-wrapper');
                let swiper = new Swiper('.growth-training-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(20, 'rem'),
                    pagination: {
                        el: '.growth-training-pagi',
                        bulletClass: 'growth-training-pagi-item',
                        bulletActiveClass: 'active'
                    }
                });
            }
            interact() {

            }
            destroy() {
                super.destroy();
            }
        },
        'growth-topic-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            animationScrub() {
            }   
            initSwiper() {
                $('.growth-topic-cms').addClass('swiper');
                $('.growth-topic-item').addClass('swiper-slide');
                $('.growth-topic-list').addClass('swiper-wrapper');
                let swiper = new Swiper('.growth-topic-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(20, 'rem'),
                    pagination: {
                        el: '.growth-topic-pagi',
                        bulletClass: 'growth-topic-pagi-item',
                        bulletActiveClass: 'active'
                    }
                });
            }
            interact() {

            }
            destroy() {
                super.destroy();
            }
        },
    }
    const GrowthCategoryPage = {
        'growth-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            animationScrub() {
            }   
            initSwiper() {
                $('.growth-hero-category-wrap').addClass('swiper');
                $('.growth-hero-category-item').addClass('swiper-slide');
                $('.growth-hero-category').addClass('swiper-wrapper');
                let swiper = new Swiper('.growth-hero-category-wrap', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(4, 'rem')
                });
            }
            interact() {
                $(window).on('scroll', () => {
                    let heroBottom = $('.growth-hero').offset().top + $('.growth-hero').outerHeight();
                    let scrollTop = $(window).scrollTop();
                    let stickySearch = $('.growth-hub-search-sticky');
                    let footer = $('.footer');
                    
                    if(scrollTop > heroBottom) {
                        console.log('active');
                        stickySearch.addClass('active');
                    } else {
                        stickySearch.removeClass('active');
                    }
                    
                    // Remove class active when bottom chạm .footer
                    if(footer.length && stickySearch.length) {
                        let footerTop = footer.offset().top;
                        let stickyBottom = scrollTop + viewport.h;
                        
                        if(stickyBottom >= footerTop) {
                            stickySearch.removeClass('active');
                        }
                    }
                });
                $('.growth-hero-form-inner').on('submit', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    let value = $(this).find('.growth-hero-input').val();
                    if(!value) {
                        return false;
                    }
                    else {
                        let href ='/result?search=' + value;
                        window.location.href = href;
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'tp-articles-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                
            }
            interact() {
                $('.tp-articles-sort-inner').on('click', function(e) {
                    e.preventDefault();
                    $(this).closest('.tp-articles-sort-main').toggleClass('active');

                });
                $('.tp-articles-sort-dropdown-item').on('click', (e) =>{
                    e.preventDefault();
                    let text = $(e.target).closest('.tp-articles-sort-dropdown-item')   .find('.txt').text();
                    $('.tp-articles-sort-dropdown-item').removeClass('active');
                    $(e.target).addClass('active');
                    $('.tp-articles-sort-inner').find('.txt').text(text);
                    $('.tp-articles-sort-main').removeClass('active');
                    let type = $(e.target).closest('.tp-articles-sort-dropdown-item').attr('data-type');
                    this.sortItem(type);
                });
                $(document).on('click', function(e) {
                    if(!$(e.target).closest('.tp-articles-sort-main').length) {
                        $('.tp-articles-sort-main').removeClass('active');
                    }
                });
            }
            sortItem(type) {
                console.log(type);
                let items = $('[data-title][data-date]').toArray();
                let container = $(items[0]).parent();
                
                if(type === 'name') {
                    // Sort theo title từ a-z
                    items.sort((a, b) => {
                        let titleA = $(a).attr('data-title').toLowerCase();
                        let titleB = $(b).attr('data-title').toLowerCase();
                        return titleA.localeCompare(titleB);
                    });
                } else if(type === 'date') {
                    // Sort theo date mới nhất đến cũ nhất
                    items.sort((a, b) => {
                        let dateA = new Date($(a).attr('data-date'));
                        let dateB = new Date($(b).attr('data-date'));
                        return dateB - dateA; // Mới nhất trước
                    });
                }
                
                // Sắp xếp lại vị trí trong DOM
                items.forEach(item => {
                    container.append(item);
                });
            }
            destroy() {
                super.destroy();
            }
        }
    }
    const StoriesPage = {
        'home-trust-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                 let marquee = new Marquee($('.home-trust-logo-main'), $('.home-trust-logo-list'), 40);
                 marquee.setup();
                 marquee.play();
            }
        },
        'stories-people-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();

                };
            }
            animationReveal() {
                if(viewport.w < 768) {
                    $('.stories-people-item-content').attr('data-lenis-prevent', 'true');
                    $('.stories-people-item-content').on('touchstart', () => {
                        smoothScroll.stop();
                    });
                    
                    // Kiểm tra khi scroll đến cuối thì tự động start smoothScroll
                    $('.stories-people-item-content').on('scroll', function() {
                        const element = $(this)[0];
                        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
                        
                        if (isAtBottom) {
                            smoothScroll.start();
                        }
                    });
                    
                    $('.stories-people-item-content').on('touchend', () => {
                        smoothScroll.start();
                    });
                    $('.stories-people').css('height', viewport.h);
                    let heightContent = viewport.h - parseFloat($('.stories-people').css('padding-top'))*2 - $('.stories-people-title').outerHeight(true) - $('.stories-people-thumb-cms').outerHeight(true) - cvUnit(27, 'rem') ;
                    $('.stories-people-cms-wrap').css('height', heightContent + 'px');
                }
                activeItem(['.stories-people-thumb-item', '.stories-people-bg-item'], 0);  
                const items = gsap.utils.toArray('.stories-people-thumb-item');
                if (items.length === 0) return;
                
                // Tạo timeline với repeat vô hạn
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.stories-people',
                        start: 'top top+=75%',
                        once: true,
                    },
                    repeat: -1 });
                
                items.forEach((item, index) => {
                    // Thêm label để dễ seek đến vị trí này
                    tl.addLabel(`item-${index}`);
                    
                    tl.add(() => {
                        // Add class active cho item hiện tại
                        items.forEach(el => el.classList.remove('active'));
                        activeItem(['.stories-people-thumb-item', '.stories-people-bg-item'], index);
                        if (this.swiperContent && this.swiperContent.activeIndex !== index) {
                            this.isManualSlide = false;
                            this.swiperContent.slideTo(index);
                        }
                    })
                    .to(item, {
                        '--progress': 100,
                        duration: 8, // Thời gian chạy từ 0-100 (có thể điều chỉnh)
                        ease: 'linear',
                        onStart: () => {
                            gsap.set(item, { '--progress': 0 });
                        },
                        onComplete: () => {
                            // Remove class active và reset --progress về 0
                            item.classList.remove('active');
                            $('.stories-people-bg-item').eq(index).removeClass('active');
                            gsap.set(item, { '--progress': 0 });
                        }
                    });
                });
                
                this.timeline = tl;
                
                // Khởi tạo Swiper và lắng nghe sự kiện slideChange
                this.swiperContent = new Swiper('.stories-people-cms', {
                    slidesPerView: 1,
                    effect: "fade",
                    navigation: {
                        nextEl: '.stories-people-cms-control-item.item-next',
                        prevEl: '.stories-people-cms-control-item.item-prev',
                    },
                    fadeEffect: {
                        crossFade: true,
                    },
                    on: {
                        slideChange: (swiper) => {
                            const activeIndex = swiper.activeIndex;
                            
                            items.forEach((item, idx) => {
                                gsap.set(item, { '--progress': 0 });
                                item.classList.remove('active');
                                $('.stories-people-bg-item').eq(idx).removeClass('active');
                            });
                            
                            activeItem(['.stories-people-thumb-item', '.stories-people-bg-item'], activeIndex);
                            
                            this.timeline.pause();
                            this.timeline.seek(`item-${activeIndex}`);
                            this.timeline.play();
                        }
                    }
                });
                
                items.forEach((item, index) => {
                    $(item).on('click', () => {
                        items.forEach((el, idx) => {
                            gsap.set(el, { '--progress': 0 });
                            el.classList.remove('active');
                            $('.stories-people-bg-item').eq(idx).removeClass('active');
                        });
                        
                        activeItem(['.stories-people-thumb-item', '.stories-people-bg-item'], index);
                        
                        if (this.swiperContent) {
                            this.swiperContent.slideTo(index);
                        }
                        
                        this.timeline.pause();
                        this.timeline.seek(`item-${index}`);
                        this.timeline.play();
                    });
                });
            }
            interact() {
                $('.stories-people-item-btn').on('click', (e) => {
                    e.preventDefault();
                    let link = $(e.target).closest('.stories-people-item-btn').attr('href');
                    $('.popup-video-iframe').attr('src', link);
                    $('.popup-video').addClass('active');
                    smoothScroll.stop();
                });
                $('.popup-video-close').on('click', () => {
                    $('.popup-video-iframe').attr('src', '');
                    $('.popup-video').removeClass('active');
                    smoothScroll.start();
                });
            }
            destroy() {
                if (this.timeline) {
                    this.timeline.kill();
                }
                if (this.swiperContent) {
                    this.swiperContent.destroy();
                }
                super.destroy();
            }
        },
        'stories-support-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w > 992) {
                    let marquee = new Marquee($('.stories-support-cms'), $('.stories-support-list'), 120);
                    marquee.setup();
                    marquee.play();
                }
                else {
                    $('.stories-support-cms').addClass('swiper');
                    $('.stories-support-list').addClass('swiper-wrapper');
                    $('.stories-support-item').addClass('swiper-slide');
                    $('.stories-support-cms').css('grid-column-gap', 0);
                    const swiper = new Swiper('.stories-support-cms', {
                        slidesPerView: 'auto',
                        spaceBetween: cvUnit(20, 'rem'),
                        pagination: {
                            el: '.stories-support-pagi',
                            bulletClass: 'stories-support-pagi-item',
                            bulletActiveClass: 'active',
                            clickable: true,
                        }
                    });
                }
            }
            animationScrub() {
            }
            interact() {
                $('.stories-support-item-link').on('click', (e) => {
                    console.log('click');
                    e.preventDefault();
                    let link = $(e.target).closest('.stories-support-item-link').attr('href');
                    $('.popup-video-iframe').attr('src', link);
                    $('.popup-video').addClass('active');
                    smoothScroll.stop();
                });
                $('.popup-video-close').on('click', () => {
                    $('.popup-video-iframe').attr('src', '');
                    $('.popup-video').removeClass('active');
                    smoothScroll.start();
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'stories-fb-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if($('.stories-fb-item').length == 0) {
                    $('.stories-fb').hide();
                }
                if(viewport.w > 992) {
                    let marquee = new Marquee($('.stories-fb-cms'), $('.stories-fb-list'), 120, 'right');
                    marquee.setup();
                    marquee.play();
                }
                else {
                    $('.stories-fb-cms').addClass('swiper');
                    $('.stories-fb-list').addClass('swiper-wrapper');
                    $('.stories-fb-item').addClass('swiper-slide');
                    $('.stories-fb-cms').css('grid-column-gap', 0);
                    const swiper = new Swiper('.stories-fb-cms', {
                        slidesPerView: 'auto',
                        spaceBetween: cvUnit(20, 'rem'),
                        pagination: {
                            el: '.stories-fb-pagi',
                            bulletClass: 'stories-fb-pagi-item',
                            bulletActiveClass: 'active',
                            clickable: true,
                        }
                    });
                }
            }
            animationScrub() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        // 'stories-work-wrap': class extends TriggerSetup {
        //     constructor() {
        //         super();
        //         this.onTrigger = () => {
        //             if(viewport.w >= 992) {
        //                 this.progressBarItem();
        //             }
        //             else {
        //                 this.initSwiper();
        //             }
        //             this.animationReveal();
        //             this.interact();
        //         };
        //         this.lastActiveIndex = 0;
        //         this.firstLoading = false;
        //     }
        //     animationReveal() {
                
        //     }
        //     progressBarItem() {
        //         const items = gsap.utils.toArray('.stories-work-item');
        //         if (items.length === 0) return;
                
        //         const tl = gsap.timeline({
        //             scrollTrigger: {
        //                 trigger: '.stories-work',
        //                 start: 'top top+=65%',
        //                 once: true,
        //             },
        //             repeat: -1,
        //         });
        //         $('.stories-work-card-item').each((_, item) => {
        //             let itemTitle = SplitText.create($(item).find('.stories-work-card-item-title .heading'), { type: "words", mask: "lines", wordsClass: 'word-item' })
        //             let itemSub = SplitText.create($(item).find('.stories-work-card-item-sub .txt'), { type: "words", mask: "lines", wordsClass: 'word-item' })
        //             let itemDesc = SplitText.create($(item).find('.stories-work-card-item-desc .txt'), { type: "words", mask: "lines", wordsClass: 'word-item' })
        //             let itemImg = $(item).find('.stories-work-card-item-img img');
        //             gsap.set(itemTitle.words, { opacity: 0, yPercent: 100 });
        //             gsap.set(itemSub.words, { opacity: 0, yPercent: 100 });
        //             gsap.set(itemDesc.words, { opacity: 0, yPercent: 100 });
        //             gsap.set(itemImg, { opacity: 0, scale: 1.2 });
        //         });
        //         items.forEach((item, index) => {
        //             const progressBar = item.querySelector('.stories-work-item-line-progress');
        //             if (!progressBar) return;
                    
        //             tl.addLabel(`item-${index}`);
                    
        //             tl.add(() => {
        //                 this.animItemCard(index);
        //             })
        //             .fromTo(progressBar, 
        //                 { transform: 'translateX(-100%)' },
        //                 { 
        //                     transform: 'translateX(0%)',
        //                     duration: 5,
        //                     ease: 'linear',
        //                     onComplete: () => {
        //                         gsap.set(progressBar, { transform: 'translateX(-100%)' });
        //                         item.classList.remove('active');
        //                     }
        //                 }
        //             );
        //         });
                
        //         this.timeline = tl;
                
        //         items.forEach((item, index) => {
        //             $(item).on('click', () => {
        //                 this.timeline.pause();
                        
                        
        //                 this.timeline.seek(`item-${index}`);
        //                 items.forEach((el, idx) => {
        //                     const bar = el.querySelector('.stories-work-item-line-progress');
        //                     if (bar) {
        //                         gsap.set(bar, { transform: 'translateX(-100%)' });
        //                     }
        //                     el.classList.remove('active');
        //                 });
        //                 this.timeline.play();
        //             });
        //         });
        //     }
        //     animItemCard(index) {
        //         let item = $('.stories-work-card-item').eq(index);
        //         $(item).find('.stories-work-card-item-inner').each((_, itemInner) => {
        //             let itemInnerEl = $(itemInner);
        //             let itemTitle = itemInnerEl.find('.stories-work-card-item-title .heading .word-item');
        //             let itemImg = itemInnerEl.find('.stories-work-card-item-img img');
        //             let itemSub = itemInnerEl.find('.stories-work-card-item-sub .txt .word-item');
        //             let itemDesc = itemInnerEl.find('.stories-work-card-item-desc .txt .word-item');
        //             gsap.to(itemTitle, { opacity: 1, yPercent: 0, duration: .4, stagger: 0.02 });
        //             gsap.to(itemSub, { opacity: 1, yPercent: 0, duration: .4, stagger: 0.015});
        //             gsap.to(itemDesc, { opacity: 1, yPercent: 0, duration: .4, stagger: 0.01});
        //             gsap.to(itemImg, { opacity: 1, scale: 1, duration: 1.2 });
        //         })
        //         activeItem(['.stories-work-card-item', '.stories-work-item'], index);
        //         let lastItem = $('.stories-work-card-item').eq(this.lastActiveIndex);
        //         let itemTitleLast = lastItem.find('.stories-work-card-item-title .heading .word-item');
        //         let itemSubLast = lastItem.find('.stories-work-card-item-sub .txt .word-item');
        //         let itemDescLast = lastItem.find('.stories-work-card-item-desc .txt .word-item');
        //         let itemImgLast = lastItem.find('.stories-work-card-item-img img');
        //         if(this.firstLoading) {
        //             setTimeout(() => {
        //                 gsap.set(itemTitleLast, { opacity: 0, yPercent: 100 });
        //                 gsap.set(itemSubLast, { opacity: 0, yPercent: 100 });
        //                 gsap.set(itemDescLast, { opacity: 0, yPercent: 100 });
        //                 gsap.set(itemImgLast, { opacity: 0, scale: 1.2 });
        //             }, 1000);
        //         }
        //         this.firstLoading = true;
        //         this.lastActiveIndex = index;

        //     } 
        //     initSwiper() {
        //         $('.stories-work-item-content-wrap').each((_, item) => {
        //             let swiper = new Swiper($(item).get(0), {
        //                 slidesPerView: 'auto',
        //                 spaceBetween: cvUnit(20, 'rem')
        //             });
        //         });
        //     }
        //     interact() {
        //         if(viewport.w < 992) {
        //             $('.stories-work-item-title-wrap').on('click', function(e) {
        //                 e.preventDefault();
        //                 $(this).closest('.stories-work-item').toggleClass('active');
        //                 $(this).closest('.stories-work-item').find('.stories-work-item-content-wrap').slideToggle();
        //             });
        //             $('.stories-work-item-title-wrap').eq(0).click();
        //         }
        //     }
        //     destroy() {
        //         if (this.timeline) {
        //             this.timeline.kill();
        //         }
        //         super.destroy();
        //     }
        // },
    }
    const PricingPage = {
        'pricing-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 767) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
            }
            interact() {
                console.log('interact');
                $('.pricing-hero-package-item-link-popup').on('click', function(e) {
                    e.preventDefault();
                    let dataTable = $(this).attr('data-table');
                    $('.pricing-popup-table').removeClass('active');
                    $('.pricing-popup-table[data-table="' + dataTable + '"]').addClass('active');
                    $('.pricing-popup').addClass('active');
                    smoothScroll.stop();
                });
                $('.pricing-popup-close').on('click', function(e) {
                    e.preventDefault();
                    $('.pricing-popup').removeClass('active');
                    $('.pricing-popup-table').removeClass('active');
                    smoothScroll.start();
                });
            }
            initSwiper() {
                $('.pricing-hero-package-wrap').addClass('swiper');
                $('.pricing-hero-package').addClass('swiper-wrapper');
                $('.pricing-hero-package-item').addClass('swiper-slide');
                const swiper = new Swiper('.pricing-hero-package-wrap', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(20, 'rem'),
                    pagination: {
                        el: '.pricing-hero-pagi',
                        bulletClass: 'pricing-hero-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'pricing-plan-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                };
            }
            animationReveal() {
            }
            initSwiper() {
                console.log('initSwiper222');
                $('.pricing-plan-cms').addClass('swiper');
                $('.pricing-plan-list').addClass('swiper-wrapper');
                $('.pricing-plan-item').addClass('swiper-slide');
                const swiper = new Swiper('.pricing-plan-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.pricing-plan-pagi',
                        bulletClass: 'pricing-plan-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'faq-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                $('.faq-item-sub').hide();
                // this.activeFaqItem($(this).find('.faq-item').eq(0));
                $('.faq-item').on('click', (e) => {
                    e.preventDefault();
                    this.activeFaqItem(e.currentTarget);
                });
            }
            activeFaqItem(item) {
                const $item = $(item);
                const $itemSub = $item.find('.faq-item-sub');
                const isActive = $item.hasClass('active');
                
                if (isActive) {
                    $item.removeClass('active');
                    $itemSub.slideUp();
                } else {
                    $('.faq-item').removeClass('active');
                    $('.faq-item-sub').slideUp();
                    $item.addClass('active');
                    $itemSub.slideDown();
                }
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const ResultPage = {
        'growth-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                let search = window.location.search;
                let searchParams = new URLSearchParams(search);
                let searchValue = searchParams.get('search');
                let categoryValue = searchParams.get('category');
                if(searchValue) {
                    $('.growth-hero-input').val(searchValue);
                    this.searchValue(searchValue);
                }
                else if (categoryValue) {
                    this.searchCategory(categoryValue);
                }
            }
            searchValue(value) {
                let items = $('[data-title]');
                $('.result-loading').fadeIn();
                $('.result-main-wrap').fadeOut();
                let isMatch = false;
                let countMatch = 0;
                items.each((_, item) => {
                    let itemTitle = $(item).attr('data-title');
                    isMatch = itemTitle.toLowerCase().includes(value.toLowerCase());
                    if(isMatch) {
                        $(item).addClass('active').show();
                        countMatch++;
                    }
                    else {
                        $(item).removeClass('active').hide();
                    }
                });
                $('.result-section').each((_, item) => {   
                    let lengthActiveItem = $(item).find('[data-title].active').length;

                    if(lengthActiveItem == 0){
                        $(item).closest('.web-component').hide();
                    }
                    else {
                        $(item).closest('.web-component').show();
                    }
                })
                if(countMatch > 0) {
                    $('.result-loading').fadeOut();
                    setTimeout(() => {
                        $('.result-main-wrap').fadeIn();
                        $('.result-loading-inner').removeClass('hide');
                        $('.result-loading-empty').addClass('hide');
                    }, 210);
                }
                else {
                    $('.result-loading-inner').addClass('hide');
                    $('.result-loading-empty').removeClass('hide');
                }
            }
            searchCategory(value) {
                let items = $('[data-title]');
                $('.result-loading').fadeIn();
                $('.result-main-wrap').fadeOut();
                let isMatch = false;
                let countMatch = 0;
                items.each((_, item) => {
                    let itemCategory = $(item).attr('data-category');
                    if(!itemCategory) {
                        $(item).removeClass('active').hide();
                        return;
                    }
                    isMatch = itemCategory.toLowerCase().includes(value.toLowerCase());
                    if(isMatch) {
                        $(item).addClass('active').show();
                        countMatch++;
                    }
                    else {
                        $(item).removeClass('active').hide();
                    }
                });
                $('.result-section').each((_, item) => {   
                    let lengthActiveItem = $(item).find('[data-title].active').length;

                    if(lengthActiveItem == 0){
                        $(item).closest('.web-component').hide();
                    }
                    else {
                        $(item).closest('.web-component').show();
                    }
                })
                if(countMatch > 0) {
                    $('.result-loading').fadeOut();
                    setTimeout(() => {
                        $('.result-main-wrap').fadeIn();
                        $('.result-loading-inner').removeClass('hide');
                        $('.result-loading-empty').addClass('hide');
                    }, 210);
                }
                else {
                    $('.result-loading-inner').addClass('hide');
                    $('.result-loading-empty').removeClass('hide');
                }
            }
            interact() {
                $('.growth-hero-form-inner').on('submit', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    let value = $(this).find('.growth-hero-input').val();
                    console.log(value);
                    this.searchValue(value);
                });
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const EventDetailPage = {
        'dt-event-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.initContent();
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    header.registerDependent('.dt-event-hero-tab-wrap.only-tb');
                }
            }
            interact() {
                $('.dt-event-hero-tab-inner.only-tb').on('click', function(e) {
                    e.preventDefault();
                    $(this).toggleClass('active');
                });
                $('.dt-event-hero-tab-title-item').on('click', function(e) {
                    e.preventDefault();
                    let dataTitle = $(this).attr('data-title');
                    $('.dt-event-hero-tab-title-item').removeClass('active');
                    $(this).addClass('active');
                    $('.dt-event-hero-content h2').each((i, el) => {
                        let elDataTitle = $(el).attr('data-title');
                        if(elDataTitle == dataTitle) {
                            $(el).addClass('active');
                        }
                    })
                    if(viewport.w < 992) {
                        $('.dt-event-hero-tab-inner.only-tb').removeClass('active');
                        $('.dt-event-hero-tab-inner.only-tb .dt-event-hero-tab-txt .txt').text($(this).find('.txt').text());
                    }
                    let offset = viewport.h / 2*-1;
                    smoothScroll.scrollTo(`.dt-article-hero-content h2[data-title="${dataTitle}"]`, {
                        offset: offset
                    });

                });
                let scrollTicking = false;
                smoothScroll.lenis.on('scroll', () => {
                    if(!scrollTicking) {
                        window.requestAnimationFrame(() => {
                            this.itemContentActiveCheck();
                            scrollTicking = false;
                        });
                        scrollTicking = true;
                    }
                });
                shareLink();
            }
            initContent() {
                $('[href="/section-recording-link"]').each((i, el) => {
                    let href = $(el).text().split(',');
                    console.log(href);
                    href.forEach((item, index) => {
                        //create iframe width src by href
                        let iframe = $(document.createElement('iframe')).attr('src', item).css({
                            'width': '100%',
                            'aspect-ratio': '16/9'
                        });
                        // append next to el
                        $(el).after(iframe);
                    });
                    $(el).remove();
                });
                let tableItem = $('.dt-event-hero-tab-title-item').eq(0).clone();
                $('.dt-event-hero-tab-title').empty();
                $('.dt-event-hero-content h2').each((i, el) => {
                    $(el).attr('data-title', `toch-${i}`);
                    let tableItemClone = tableItem.clone();
                    if(i == 0) {
                        tableItemClone.addClass('active');
                        if(viewport.w < 992) {
                            $('.dt-event-hero-tab-inner.only-tb .dt-event-hero-tab-txt .txt').text($(el).text());
                        }
                    }
                    let cleanText = $(el).text();
                    tableItemClone.find('.txt').text(cleanText);
                    tableItemClone.attr('data-title', `toch-${i}`);
                    $('.dt-event-hero-tab-title').append(tableItemClone);
                })
                let topCenter = (viewport.h - $('.dt-event-hero-tab-inner').height()) / 2;
                $('.dt-event-hero-tab-inner').css('top', topCenter);
            }
            itemContentActiveCheck() {
                const viewportHeight = $(window).height();
                const halfHeight = viewportHeight / 2;
                
                $('.dt-event-hero-content h2').each((i, el) => {
                    const rect = el.getBoundingClientRect();
                    const dataTitle = el.getAttribute('data-title');
                    
                    if (rect.top > 0 && rect.top - $(el).height() < halfHeight) {
                        const $tableItem = $(`.dt-event-hero-tab-title-item[data-title="${dataTitle}"]`);
                        if(viewport.w < 992) {
                            $('.dt-event-hero-tab-inner.only-tb .dt-event-hero-tab-txt .txt').text($(el).text());
                            
                        }
                        $('.dt-event-hero-tab-title-item').removeClass('active');
                        $tableItem.addClass('active');
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const VideoDetailPage = {
        'dt-video-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.initContent();
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    header.registerDependent('.dt-video-hero-tab-wrap.only-tb');
                }
            }
            interact() {
                if(viewport.w < 992) {
                    $('.dt-video-hero-tab-inner.only-tb ').on('click', function(e) {
                        e.preventDefault();
                        $(this).toggleClass('active');
                    });
                }
                $('.dt-video-hero-tab-title-item').on('click', function(e) {
                    e.preventDefault();
                    let dataTitle = $(this).attr('data-title');
                    $('.dt-video-hero-tab-title-item').removeClass('active');
                    $(this).addClass('active');
                    $('.dt-video-hero-content h2').each((i, el) => {
                        let elDataTitle = $(el).attr('data-title');
                        if(elDataTitle == dataTitle) {
                            $(el).addClass('active');
                        }
                        if(viewport.w < 992) {
                            $('.dt-video-hero-tab-inner:not(.mode-dk) .dt-video-hero-tab-txt .txt').text($(el).text());
                            $(this).addClass('active');
                            $('.dt-video-hero-tab-inner:not(.mode-dk)').removeClass('active');
                        }
                    })
                    let offset = viewport.h / 2*-1;
                    smoothScroll.scrollTo(`.dt-article-hero-content h2[data-title="${dataTitle}"]`, {
                        offset: offset
                    });

                });
                let scrollTicking = false;
                smoothScroll.lenis.on('scroll', () => {
                    if(!scrollTicking) {
                        window.requestAnimationFrame(() => {
                            this.itemContentActiveCheck();
                            scrollTicking = false;
                        });
                        scrollTicking = true;
                    }
                });
                shareLink();
            }
            initContent() {
                let tableItem = $('.dt-video-hero-tab-title-item').eq(0).clone();
                $('.dt-video-hero-tab-title').empty();
                $('.dt-video-hero-content h2').each((i, el) => {
                    $(el).attr('data-title', `toch-${i}`);
                    let tableItemClone = tableItem.clone();
                    if(i == 0) {
                        tableItemClone.addClass('active');
                        if(viewport.w < 992) {
                            $('.dt-video-hero-tab-inner:not(.mode-dk) .dt-video-hero-tab-txt .txt').text($(el).text());
                        }
                    }
                    let cleanText = $(el).text();
                    tableItemClone.find('.txt').text(cleanText);
                    tableItemClone.attr('data-title', `toch-${i}`);
                    $('.dt-video-hero-tab-title').append(tableItemClone);
                })
                let topCenter = (viewport.h - $('.dt-video-hero-tab-inner').height()) / 2;
                $('.dt-video-hero-tab-inner').css('top', topCenter);
            }
            
            itemContentActiveCheck() {
                const viewportHeight = $(window).height();
                const halfHeight = viewportHeight / 2;
                
                $('.dt-video-hero-content h2').each((i, el) => {
                    const rect = el.getBoundingClientRect();
                    const dataTitle = el.getAttribute('data-title');
                    
                    if (rect.top > 0 && rect.top - $(el).height() < halfHeight) {
                        const $tableItem = $(`.dt-video-hero-tab-title-item[data-title="${dataTitle}"]`);
                        
                        $('.dt-video-hero-tab-title-item').removeClass('active');
                        if(viewport.w < 992) {
                            $('.dt-video-hero-tab-inner:not(.mode-dk) .dt-video-hero-tab-txt .txt').text($(el).text());

                        }
                        $tableItem.addClass('active');
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'dt-video-related-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                };
            }
            initSwiper() {
                console.log('initSwiper');
                $('.dt-video-related-cms').addClass('swiper');
                $('.dt-video-related-list').addClass('swiper-wrapper');
                $('.dt-video-related-item').addClass('swiper-slide');
                const swiper = new Swiper(".dt-video-related-cms", {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.dt-video-related-pagi',
                        bulletClass: 'dt-video-related-pagi-item',
                        bulletActiveClass: 'active'
                    }
                })
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const GuideDetailPage = {
        'dt-guide-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.initContent();
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    header.registerDependent('.dt-guide-hero-tab-wrap.only-tb')
                }
            }
            interact() {
                if(viewport.w < 992) {
                    $('.dt-guide-hero-tab-inner:not(.mode-dk)').on('click', function(e) {
                        e.preventDefault();
                        $(this).toggleClass('active');
                    })
                }
                $('.dt-guide-hero-tab-title-item').on('click', function(e) {
                    e.preventDefault();
                    let dataTitle = $(this).attr('data-title');
                    $('.dt-guide-hero-tab-title-item').removeClass('active');
                    $(this).addClass('active');
                    $('.dt-guide-hero-content h2').each((i, el) => {
                        let elDataTitle = $(el).attr('data-title');
                        if(elDataTitle == dataTitle) {
                            $(el).addClass('active');
                        }
                    })
                    if(viewport.w < 992) {
                        $('.dt-guide-hero-tab-inner:not(.mode-dk)').removeClass('active');
                        $('.dt-guide-hero-tab-inner:not(.mode-dk) .dt-guide-hero-tab-txt .txt').text($(this).text());

                        $(this).addClass('active');

                    }
                    let offset = viewport.h / 2*-1;
                    smoothScroll.scrollTo(`.dt-article-hero-content h2[data-title="${dataTitle}"]`, {
                        offset: offset
                    });

                });
                let scrollTicking = false;
                smoothScroll.lenis.on('scroll', () => {
                    if(!scrollTicking) {
                        window.requestAnimationFrame(() => {
                            this.itemContentActiveCheck();
                            scrollTicking = false;
                        });
                        scrollTicking = true;
                    }
                });
                shareLink();
                $('.dt-guide-hero-form-input').on('focus', (e) => {
                    $(e.currentTarget).closest('.dt-guide-hero-form-input-gr').addClass('active');
                });
                
                $('.dt-guide-hero-form-input').on('blur', (e) => {
                    const $current = $(e.currentTarget);
                    const $parent = $current.closest('.dt-guide-hero-form-input-gr').length 
                        ? $current.closest('.dt-guide-hero-form-input-gr') 
                        : $current.closest('.dt-guide-hero-form-option-input-inner');
                    
                    $parent.removeClass('active')
                        .toggleClass('filled', !!$current.val());
                });
                const $formSuccess = $('.dt-guide-form-success');
                const $inputGr = $('.dt-guide-hero-form-input-gr');
                
                const formReset = (form) => {
                    $(form)[0].reset();
                    reinitializeWebflow();
                    $('.dt-guide-hero-form-option-input-wrap').slideUp();
                    $inputGr.removeClass('active');
                    $('.input:not(.input-hidden)').closest('.dt-guide-hero-form-input-gr').removeClass('filled');
                    $('.dt-guide-hero-form-select-inner .txt').text('Select');
                }
                
                const onSuccessForm = (form) => {
                    console.log('success');
                    $formSuccess.addClass('active');
                    formReset(form);
                    setTimeout(() => {
                        $formSuccess.removeClass('active');
                    }, 5000);
                }
                
                $('.dt-guide-form-success-btn').on('click', (e) => {
                    e.preventDefault();
                    $formSuccess.removeClass('active');
                });
                
                $('.dt-guide-hero-form-submit-new').on('click', (e) => {
                    if (this.checkFormValid()) {
                        this.submitHubspot();
                    }
                    else {
                        e.preventDefault();

                    }
                });
            }
            checkEmailValid(emailValue) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(emailRegex.test(emailValue)) {
                    return true;
                } else {
                    return false;
                }
            }
            checkFormValid() {
                const fullName = $('input[name="Full-Name"]');
                const email = $('input[name="Email"]');
                const messageEmail = "Invalid email";
                let isValid = true;
                if(!fullName.val()) {
                    fullName.closest('.dt-guide-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    fullName.closest('.dt-guide-hero-form-input-gr').removeClass('error');
                }
                if(!email.val()) {
                    email.closest('.dt-guide-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else if(!this.checkEmailValid(email.val())) {
                    email.closest('.dt-guide-hero-form-input-gr').find('.dt-guide-hero-form-valid .txt').text(messageEmail);
                    email.closest('.dt-guide-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    email.closest('.dt-guide-hero-form-input-gr').removeClass('error');
                }
                return isValid;
            }
            submitHubspot() {
                const hubspot = {
                    portalId: 530303,
                    formId: "1cf30793-5250-4788-82ff-5c38cd4836aa",
                    fields: [
                        { name: "full_name", value: (data) => data["Full-Name"] },
                        { name: "email", value: (data) => data["Email"] }
                    ],
                };
                
                const currentLocale = $('html').attr('lang');
                if(currentLocale == 'en-GB') {
                    hubspot.formId = "680ebb16-a7f0-46cd-adc2-334d5381c441";
                }
                else if(currentLocale == 'en-AU') {
                    hubspot.formId = "4dca4fbb-2260-4085-8caa-362a9bd497e0";
                }
                
                const { portalId, formId, fields } = hubspot;
                let url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
                const data = mapFormToObject($('#download-free-guide').get(0));
                
                const mapField = (data) => {
                    if (!fields.length) return [];
                    
                    const result = fields.map((field) => {
                        const { name, value } = field;
                        if (!value) {
                            return {
                                name,
                                value: data[name] || "",
                            };
                        } else {
                            const getValue = value(data);
                            return {
                                name,
                                value: getValue || "",
                            };
                        }
                    });
                    return result;
                };
                
                const mappedFields = mapField(data);
                console.log(mappedFields);
                const dataSend = {
                    fields: mappedFields,
                    context: {
                        pageUri: window.location.href,
                        pageName: "Guide Download",
                    },
                };
                
                $.ajax({
                    url: url,
                    method: "POST",
                    data: JSON.stringify(dataSend),
                    dataType: "json",
                    headers: {
                        accept: "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                    contentType: "application/json",
                    success: (response) => {
                        console.log('Form submitted successfully:', response);
                        const $formSuccess = $('.dt-guide-form-success');
                        const $inputGr = $('.dt-guide-hero-form-input-gr');
                        
                        $formSuccess.addClass('active');
                        $('#download-free-guide form')[0].reset();
                        $inputGr.removeClass('active filled error');
                        
                        setTimeout(() => {
                            $formSuccess.removeClass('active');
                        }, 5000);
                    },
                    error: (xhr, resp, text) => {
                        console.error('Form submission failed:', xhr, resp, text);
                        alert('Something went wrong. Please try again.');
                    },
                });
            }
            initContent() {
                let tableItem = $('.dt-guide-hero-tab-title-item').eq(0).clone();
                $('.dt-guide-hero-tab-title').empty();
                $('.dt-guide-hero-content h2').each((i, el) => {
                    $(el).attr('data-title', `toch-${i}`);
                    let tableItemClone = tableItem.clone();
                    if(i == 0) {
                        tableItemClone.addClass('active');
                        if(viewport.w < 992) {
                            $('.dt-guide-hero-tab-inner:not(.mode-dk) .dt-guide-hero-tab-txt .txt').text($(el).text());
                        }
                    }
                    let cleanText = $(el).text();
                    tableItemClone.find('.txt').text(cleanText);
                    tableItemClone.attr('data-title', `toch-${i}`);
                    $('.dt-guide-hero-tab-title').append(tableItemClone);
                    let topCenter = (viewport.h - $('.dt-guide-hero-tab-inner').height()) / 2;
                    $('.dt-guide-hero-tab-inner').css('top', topCenter);
                })
            }
            itemContentActiveCheck() {
                const viewportHeight = $(window).height();
                const halfHeight = viewportHeight / 2;
                
                $('.dt-guide-hero-content h2').each((i, el) => {
                    const rect = el.getBoundingClientRect();
                    const dataTitle = el.getAttribute('data-title');
                    
                    if (rect.top > 0 && rect.top - $(el).height() < halfHeight) {
                        const $tableItem = $(`.dt-guide-hero-tab-title-item[data-title="${dataTitle}"]`);
                        
                        $('.dt-guide-hero-tab-title-item').removeClass('active');
                        $tableItem.addClass('active');
                        if(viewport.w < 992) {
                            $('.dt-guide-hero-tab-inner:not(.mode-dk) .dt-guide-hero-tab-txt .txt').text($(el).text());

                        }
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'dt-guide-related-wrap': class extends TriggerSetup {
                constructor() {
                    super();
                    this.onTrigger = () => {
                        if(viewport.w < 992) {
                            this.initSwiper();
                        }
                    };
                }
                initSwiper() {
                    console.log('initSwiper');
                    $('.dt-guide-related-cms').addClass('swiper');
                    $('.dt-guide-related-list').addClass('swiper-wrapper');
                    $('.dt-guide-related-item').addClass('swiper-slide');

                    const swiper = new Swiper(".dt-guide-related-cms", {
                        slidesPerView: 'auto',
                        spaceBetween: cvUnit(16, 'rem'),
                        pagination: {
                            el: '.dt-guide-related-pagi',
                            bulletClass: 'dt-guide-related-pagi-item',
                            bulletActiveClass: 'active'
                        }
                    })
                }
            }
    }
    const ArticleDetailPage = {
        'dt-article-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.initContent();
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    header.registerDependent('.dt-article-hero-tab-wrap.only-tb');
                }
            }
            interact() {
                if(viewport.w < 992) {
                    $('.dt-article-hero-tab-inner.only-tb').on('click', function(e) {
                        e.preventDefault();
                        $(this).toggleClass('active');
                    })
                }
                $('.dt-article-hero-tab-title-item').on('click', function(e) {
                    e.preventDefault();
                    let dataTitle = $(this).attr('data-title');
                    $('.dt-article-hero-tab-title-item').removeClass('active');
                    $(this).addClass('active');
                    $('.dt-article-hero-content h2').each((i, el) => {
                        let elDataTitle = $(el).attr('data-title');
                        if(elDataTitle == dataTitle) {
                            $(el).addClass('active');
                        }
                    })
                    if(viewport.w < 992) {
                        $('.dt-article-hero-tab-inner.only-tb').removeClass('active');
                        $('.dt-article-hero-tab-inner.only-tb .dt-article-hero-tab-txt .txt').text($(this).find('.txt').text());
                    }
                    // i want to get offset center viewport height
                    let offset = viewport.h / 2*-1;
                    smoothScroll.scrollTo(`.dt-article-hero-content h2[data-title="${dataTitle}"]`, {
                        offset: offset
                    });

                });
                let scrollTicking = false;
                smoothScroll.lenis.on('scroll', () => {
                    if(!scrollTicking) {
                        window.requestAnimationFrame(() => {
                            this.itemContentActiveCheck();
                            scrollTicking = false;
                        });
                        scrollTicking = true;
                    }
                });
                shareLink();
            }
            initContent() {
                let tableItem = $('.dt-article-hero-tab-title-item').eq(0).clone();
                $('.dt-article-hero-tab-title').empty();
                $('.dt-article-hero-content h2').each((i, el) => {
                    $(el).attr('data-title', `toch-${i}`);
                    let tableItemClone = tableItem.clone();
                    if(i == 0) {
                        tableItemClone.addClass('active');
                        if(viewport.w < 992) {
                            $('.dt-article-hero-tab-inner.only-tb .dt-article-hero-tab-txt .txt').text($(el).text());
                        }
                    }
                    let cleanText = $(el).text();
                    tableItemClone.find('.txt').text(cleanText);
                    tableItemClone.attr('data-title', `toch-${i}`);
                    $('.dt-article-hero-tab-title').append(tableItemClone);
                    let topCenter = (viewport.h - $('.dt-article-hero-tab-inner').height()) / 2;
                    $('.dt-article-hero-tab-inner').css('top', topCenter);
                })
            }
            itemContentActiveCheck() {
                const viewportHeight = $(window).height();
                const halfHeight = viewportHeight / 2;
                
                $('.dt-article-hero-content h2').each((i, el) => {
                    const rect = el.getBoundingClientRect();
                    const dataTitle = el.getAttribute('data-title');
                    
                    if (rect.top > 0 && rect.top - $(el).height() < halfHeight) {
                        const $tableItem = $(`.dt-article-hero-tab-title-item[data-title="${dataTitle}"]`);
                        
                        $('.dt-article-hero-tab-title-item').removeClass('active');
                        $tableItem.addClass('active');
                        if(viewport.w < 992) {
                            $('.dt-article-hero-tab-inner.only-tb .dt-article-hero-tab-txt .txt').text($(el).text());
                        }
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'dt-article-related-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                };
            }
            initSwiper() {
                console.log('initSwiper');
                $('.dt-articles-cms').addClass('swiper');
                $('.dt-articles-list').addClass('swiper-wrapper');
                $('.dt-articles-item').addClass('swiper-slide');
                let swiper = new Swiper(".dt-articles-cms", {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.dt-articles-pagi',
                        bulletClass: 'dt-articles-pagi-item',
                        bulletActiveClass: 'active'
                    }
                })
            }
        }
    }
    const AboutPage = {
        'about-story-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
            }
            interact() {
                $('.about-story-faq-item-head').on('click', function(e) {
                    e.preventDefault();
                    if($(this).closest('.about-story-faq-item').hasClass('active')) {
                        $(this).closest('.about-story-faq-item').removeClass('active');
                        $(this).closest('.about-story-faq-item').find('.about-story-faq-item-content').slideUp();
                    } else {
                        $('.about-story-faq-item').removeClass('active');
                        $(this).closest('.about-story-faq-item').addClass('active');
                        $('.about-story-faq-item-content').slideUp();
                        $(this).closest('.about-story-faq-item').find('.about-story-faq-item-content').slideDown();
                    }

                });
                $('.about-story-faq-item-head').eq(0).trigger('click');
            }
            destroy() {
                super.destroy();
            }
        },
        'stories-support-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w > 992) {
                    if(viewport.w > 992) {
                        let marquee = new Marquee($('.stories-support-cms'), $('.stories-support-list'), 120);
                        marquee.setup();
                        marquee.play();
                    }
                    else {
                        $('.stories-support-cms').addClass('swiper');
                        $('.stories-support-list').addClass('swiper-wrapper');
                        $('.stories-support-item').addClass('swiper-slide');
                        $('.stories-support-cms').css('grid-column-gap', 0);
                        const swiper = new Swiper('.stories-support-cms', {
                            slidesPerView: 'auto',
                            spaceBetween: cvUnit(20, 'rem'),
                            pagination: {
                                el: '.stories-support-pagi',
                                bulletClass: 'stories-support-pagi-item',
                                bulletActiveClass: 'active',
                                clickable: true,
                            }
                        });
                    }
                }
                else {
                    $('.stories-support-cms').addClass('swiper');
                    $('.stories-support-list').addClass('swiper-wrapper');
                    $('.stories-support-item').addClass('swiper-slide');
                    $('.stories-support-cms').css('grid-column-gap', 0);
                    const swiper = new Swiper('.stories-support-cms', {
                        slidesPerView: 'auto',
                        spaceBetween: cvUnit(20, 'rem'),
                        pagination: {
                            el: '.stories-support-pagi',
                            bulletClass: 'stories-support-pagi-item',
                            bulletActiveClass: 'active',
                            clickable: true,
                        }
                    });
                }
            }
            animationScrub() {
            }
            interact() {
                $('.stories-support-item-link').on('click', (e) => {
                    console.log('click');
                    e.preventDefault();
                    let link = $(e.target).closest('.stories-support-item-link').attr('href');
                    $('.popup-video-iframe').attr('src', link);
                    $('.popup-video').addClass('active');
                    smoothScroll.stop();
                });
                $('.popup-video-close').on('click', () => {
                    $('.popup-video-iframe').attr('src', '');
                    $('.popup-video').removeClass('active');
                    smoothScroll.start();
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'about-approach-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
            }
            interact() {
                if(viewport.w < 992) {
                    $('.about-approach-item-title-wrap').on('click', function(e) {
                        e.preventDefault();
                        if($(this).closest('.about-approach-item').hasClass('active')) {
                            $(this).closest('.about-approach-item').removeClass('active');
                            $(this).closest('.about-approach-item').find('.about-approach-item-img-main').slideUp();
                        } else {
                            $('.about-approach-item').removeClass('active');
                            $(this).closest('.about-approach-item').addClass('active');
                            $('.about-approach-item-img-main').slideUp();
                            $(this).closest('.about-approach-item').find('.about-approach-item-img-main').slideDown();
                        }
                    });
                    $('.about-approach-item-title-wrap').eq(0).trigger('click');
                }
            }
            destroy() {
                super.destroy();
            }
        },
        'about-team-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                };
            }
            animationReveal() {
                // if(viewport.w >= 992) {
                //     let topStick = viewport.h/2 - $('.about-team-head').height() / 2;
                //     $('.about-team-head').css('top', topStick);
                // }
            }
            initSwiper() {
                console.log('initSwiper');
                $('.about-team-cms').addClass('swiper');
                $('.about-team-list').addClass('swiper-wrapper');
                $('.about-team-item').addClass('swiper-slide');
                let swiper = new Swiper(".about-team-cms", {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.about-team-pagi',
                        bulletClass: 'about-team-pagi-item',
                        bulletActiveClass: 'active'
                    }
                })
            }
        },
        'about-mission-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                };
            }
            animationReveal() {
                this.tlStickFade = gsap.timeline({
                    scrollTrigger: {
                       trigger: $('.about-mission-title').get(0),
                       start: 'center+=20% bottom+=10%',
                       end: `center+=20% top+=40%`,
                       scrub: true,
                    }
                 });
                 let title = new SplitText( $('.about-mission-title .txt').get(0), {type: 'chars,words, lines'});
                 this.tlStickFade.fromTo(title.chars, {color: '#ffffff4d'}, { color: '#fff', stagger: 0.03 })
            }
            interact() {
            }
            initSwiper() {
                console.log('initSwiper');
                $('.about-mission-cms').addClass('swiper');
                $('.about-mission-list').addClass('swiper-wrapper');
                $('.about-mission-item').addClass('swiper-slide');
                let swiper = new Swiper(".about-mission-cms", {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.about-mission-pagi',
                        bulletClass: 'about-mission-pagi-item',
                        bulletActiveClass: 'active'
                    }
                })
            }
            destroy() {
                super.destroy();
            }
        },
        'about-why-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                };
            }
            initSwiper() {
                console.log('initSwiper');
                $('.about-why-cms').addClass('swiper');
                $('.about-why-list').addClass('swiper-wrapper');
                $('.about-why-item').addClass('swiper-slide');
                let swiper = new Swiper(".about-why-cms", {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.about-why-pagi',
                        bulletClass: 'about-why-pagi-item',
                        bulletActiveClass: 'active'
                    }
                })
            }
            animationReveal() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const SummitPage = {
        'summit-event-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                $('.summit-event-row-content').hide();
                this.activeFaqItem($(this).find('.summit-event-row-head').eq(0));
                
            }
            activeFaqItem(item) {
                const $item = $(item);
                const $itemSub = $item.closest('.summit-event-row').find('.summit-event-row-content');
                const isActive = $item.hasClass('active');
                
                if (isActive) {
                    $item.removeClass('active');
                    $itemSub.slideUp();
                } else {
                    $('.summit-event-row-head').removeClass('active');
                    $('.summit-event-row-content').slideUp();
                    $item.addClass('active');
                    $itemSub.slideDown();
                }
            }
            interact() {
                $('.summit-event-row-head').on('click', (e) => {
                    e.preventDefault();
                    this.activeFaqItem(e.currentTarget.closest('.summit-event-row-head'));
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'summit-make-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.summit-make-cms').addClass('swiper');
                $('.summit-make-list').addClass('swiper-wrapper');
                $('.summit-make-item').addClass('swiper-slide');
                let swiper = new Swiper(".summit-make-cms", {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                })
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'summit-make-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 768) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.summit-make-main-wrap').addClass('swiper');
                $('.summit-make-main').addClass('swiper-wrapper');
                $('.summit-make-item').addClass('swiper-slide');
                let swiper = new Swiper(".summit-make-main-wrap", {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.summit-make-pagi',
                        bulletClass: 'summit-make-pagi-item',
                        bulletActiveClass: 'active'
                    }
                })
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'summit-location-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                console.log('animationReveal');
                let titleLinkMap = SplitText.create('.summit-location-sub-txt .txt', {type: ' lines', linesClass: 'bp-line'});
                multiLineText($('.summit-location-sub-txt .txt'));
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'summit-leader-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.summit-leader-cms').addClass('swiper');
                $('.summit-leader-list').addClass('swiper-wrapper');
                $('.summit-leader-item').addClass('swiper-slide');
                let swiper = new Swiper(".summit-leader-cms", {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.summit-leader-pagi',
                        bulletClass: 'summit-leader-pagi-item',
                        bulletActiveClass: 'active'
                    }
                })
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'stories-support-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w > 992) {
                    let marquee = new Marquee($('.stories-support-cms'), $('.stories-support-list'), 120);
                    marquee.setup();
                    marquee.play();
                }
                else {
                    $('.stories-support-cms').addClass('swiper');
                    $('.stories-support-list').addClass('swiper-wrapper');
                    $('.stories-support-item').addClass('swiper-slide');
                    $('.stories-support-cms').css('grid-column-gap', 0);
                    const swiper = new Swiper('.stories-support-cms', {
                        slidesPerView: 'auto',
                        spaceBetween: cvUnit(20, 'rem'),
                        pagination: {
                            el: '.stories-support-pagi',
                            bulletClass: 'stories-support-pagi-item',
                            bulletActiveClass: 'active',
                            clickable: true,
                        }
                    });
                }
            }
            animationScrub() {
            }
            interact() {
                 $('.stories-support-item-link').on('click', (e) => {
                    console.log('click');
                    e.preventDefault();
                    let link = $(e.target).closest('.stories-support-item-link').attr('href');
                    $('.popup-video-iframe').attr('src', link);
                    $('.popup-video').addClass('active');
                    smoothScroll.stop();
                });
                $('.popup-video-close').on('click', () => {
                    $('.popup-video-iframe').attr('src', '');
                    $('.popup-video').removeClass('active');
                    smoothScroll.start();
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'faq-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                $('.faq-item-sub').hide();
                // this.activeFaqItem($(this).find('.faq-item').eq(0));
                $('.faq-item').on('click', (e) => {
                    e.preventDefault();
                    this.activeFaqItem(e.currentTarget);
                });
            }
            activeFaqItem(item) {
                const $item = $(item);
                const $itemSub = $item.find('.faq-item-sub');
                const isActive = $item.hasClass('active');
                
                if (isActive) {
                    $item.removeClass('active');
                    $itemSub.slideUp();
                } else {
                    $('.faq-item').removeClass('active');
                    $('.faq-item-sub').slideUp();
                    $item.addClass('active');
                    $itemSub.slideDown();
                }
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const ComparisonPage = {
        'comp-diff-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
            }
            interact() {
                if(viewport.w < 768) {
                    $('.comp-diff-item').on('click', (e) => {
                        e.preventDefault();
                        this.activeCompItem(e.currentTarget.closest('.comp-diff-item'));
                    });
                    $('.comp-diff-item').eq(0).trigger('click');
                }
            }
            activeCompItem(item) {
                console.log(item);
                const $item = $(item).find('.comp-diff-col-head');
                const $itemSub = $(item).find('.comp-diff-col-wrap');
                const isActive = $item.hasClass('active');
                
                if (isActive) {
                    $item.removeClass('active');
                    $itemSub.slideUp();
                } else {
                    $('.comp-diff-col-head').removeClass('active');
                    $('.comp-diff-col-wrap').slideUp();
                    $item.addClass('active');
                    $itemSub.slideDown();
                }
            }
            destroy() {
                super.destroy();
            }
        },
       'faq-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                $('.faq-item-sub').hide();
                // this.activeFaqItem($(this).find('.faq-item').eq(0));
                $('.faq-item').on('click', (e) => {
                    e.preventDefault();
                    this.activeFaqItem(e.currentTarget);
                });
            }
            activeFaqItem(item) {
                const $item = $(item);
                const $itemSub = $item.find('.faq-item-sub');
                const isActive = $item.hasClass('active');
                
                if (isActive) {
                    $item.removeClass('active');
                    $itemSub.slideUp();
                } else {
                    $('.faq-item').removeClass('active');
                    $('.faq-item-sub').slideUp();
                    $item.addClass('active');
                    $itemSub.slideDown();
                }
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const FeaturedPage = {
        'fea-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.interact();
                };
            }
            animationReveal() {
                if($('.fea-hero-img-cms').length> 0) {
                    $('.fea-hero-img-cms').each((_, item) => {
                        let direction = $(item).attr('data-direction');
                        let marquee = new Marquee($(item), $(item).find('.fea-hero-img-list'), 40, direction);
                        marquee.setup();
                        marquee.play();
                    });
                }
                
                if(viewport.w >= 992) {
                    this.items = $('.fea-hero-intro-item');
                    if(this.items.length > 0) {
                        this.setupTimeline();
                    }
                }
                else {
                    $('.fea-hero-intro-item').removeClass('active');
                    $('.fea-hero-intro-item').eq(0).addClass('active');
                    $('.fea-hero-intro-item').eq(0).find('.fea-hero-intro-item-content').slideDown();
                }
            }
            setupTimeline() {
                this.items.removeClass('active');
                this.items.eq(0).addClass('active');
                this.items.eq(0).find('.fea-hero-intro-item-content').slideDown();
                $('.fea-hero-intro-img-item').removeClass('active');
                $('.fea-hero-intro-img-item').eq(0).addClass('active');
            }
            activateItem(index) {
                this.items.removeClass('active');
                $('.fea-hero-intro-img-item').removeClass('active');
                
                this.items.eq(index).addClass('active');
                $('.fea-hero-intro-img-item').eq(index).addClass('active');
                
                $('.fea-hero-intro-item-content').slideUp(400);
                this.items.eq(index).find('.fea-hero-intro-item-content').slideDown(400);
            }
            interact() {
                if(viewport.w >= 992 && this.items) {
                    this.items.each((index, item) => {
                        $(item).find('.fea-hero-intro-item-head').on('click', (e) => {
                            e.preventDefault();
                            this.activateItem(index);
                        });
                    });
                }
                else {
                    $('.fea-hero-intro-item-head').on('click', function(e) {
                        e.preventDefault();
                        let $item = $(this).closest('.fea-hero-intro-item');
                        let $content = $item.find('.fea-hero-intro-item-content');
                        
                        if($item.hasClass('active')) {
                            $item.removeClass('active');
                            $content.slideUp();
                        }
                        else {
                            $('.fea-hero-intro-item').removeClass('active');
                            $('.fea-hero-intro-item-content').slideUp();
                            $item.addClass('active');
                            $content.slideDown();
                        }
                    });
                }
            }
            destroy() {
                $('.fea-hero-intro-item-head').off('click');
                super.destroy();
            }
        },
        'fea-system-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                if($('.fea-system-item-grow').length > 0) {
                    this.waveAnim();
                }
            }
            waveAnim() {
                console.log('waveAnim');
                let countWave = 4;
                let waveArr = $(".fea-system-item-grow-block").eq(0).clone();
                $(".fea-system-item-grow").html("");
                for (let i = 0; i < countWave; i++) {
                  let html = waveArr.clone();
                  html.css("animation-delay", `${(-15 / countWave) * i}s`);
                  $(".fea-system-item-grow").append(html);
                }
              }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'fea-complete-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                };
            }
            animationReveal() {
            }
            initSwiper() {
                $('.fea-complete-main').addClass('swiper');
                $('.fea-complete-inner').addClass('swiper-wrapper');
                $('.fea-complete-item').addClass('swiper-slide');
                let swiper = new Swiper('.fea-complete-main', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.fea-complete-pagi',
                        bulletClass: 'fea-complete-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,  
                      },
                });
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const howItWorkPage = {
        'how-progress-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.swiper = null;
                this.isDesktop = false;
                this.isUpdatingFromCode = false;
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            async animationReveal() {
                let lineClone = $('.how-progress-tab-item-line').eq(0).clone();
                $('.how-progress-tab-item-line-wrap').html('');
                $('.how-progress-tab-item-title').each((index, item) => {
                    let indexReal = `${index+1}.` 
                    $(item).find('.heading').eq(0).text(indexReal);
                });
                $('.how-progress-step').each((index, item) => {
                    $(item).find('.how-progress-step-label').text(`Step ${index+1}`);
                    let quantity = $(item).find('.how-progress-step-item').length;
                    for(let i = 0; i < quantity; i++) {
                        let html = lineClone.clone();
                        $('.how-progress-tab-item').eq(index).find('.how-progress-tab-item-line-wrap').append(html);
                    }
                });
                
                this.swiper = new Swiper('.how-progress-tab-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(24, 'rem'),
                    navigation: {
                        prevEl: '.how-progress-tab-content-item.item-prev',
                        nextEl: '.how-progress-tab-content-item.item-next',
                    },
                    on: {
                        slideChange: () => {
                            if(!this.isUpdatingFromCode) {
                                const activeIndex = this.swiper.activeIndex;
                                this.activateStep(activeIndex, 0);
                            }
                        }
                    }
                });
                
                this.isDesktop = window.innerWidth >= 992;
                
                if (this.isDesktop) {
                    this.activateStep(0, 0);
                    this.interactDesktop();
                } else {
                    header.registerDependent('.how-progress-tab-wrap');
                    this.activateStep(0, 0);
                    this.interactMobile();
                }
            }
            
            activateStep(stepIndex, itemIndex) {
                const steps = $('.how-progress-step');
                const tabItems = $('.how-progress-tab-item');
                
                steps.removeClass('active');
                tabItems.removeClass('active');
                $('.how-progress-step-item').removeClass('active');
                $('.how-progress-step-img-item').removeClass('active');
                $('.how-progress-tab-item-line').removeClass('active');
                
                const currentStep = steps.eq(stepIndex);
                const currentTabItem = tabItems.eq(stepIndex);
                const items = currentStep.find('.how-progress-step-item');
                const stepImages = currentStep.find('.how-progress-step-img-item');
                const tabItemLines = currentTabItem.find('.how-progress-tab-item-line');
                
                currentStep.addClass('active');
                currentTabItem.addClass('active');
                items.eq(itemIndex).addClass('active');
                stepImages.eq(itemIndex).addClass('active');
                tabItemLines.eq(itemIndex).addClass('active');
                
                if(this.swiper && !this.swiper.destroyed) {
                    this.isUpdatingFromCode = true;
                    this.swiper.slideTo(stepIndex);
                    setTimeout(() => {
                        this.isUpdatingFromCode = false;
                    }, 100);
                }
                
                if(viewport.w <= 992) {
                    items.eq(itemIndex).find('.how-progress-step-item-img').slideDown();
                    items.not(items.eq(itemIndex)).find('.how-progress-step-item-img').slideUp();
                }
            }
            interactDesktop() {
                $('.how-progress-tab-item').on('click', (e) => {
                    e.stopPropagation();
                    const $clickedTab = $(e.currentTarget);
                    const clickedIndex = $('.how-progress-tab-item').index($clickedTab);
                    
                    if($clickedTab.hasClass('active')) {
                        const $activeLines = $clickedTab.find('.how-progress-tab-item-line.active');
                        const $allLines = $clickedTab.find('.how-progress-tab-item-line');
                        
                        if($activeLines.length > 0) {
                            const currentLineIndex = $allLines.index($activeLines.eq(0));
                            const nextLineIndex = (currentLineIndex + 1) % $allLines.length;
                            this.activateStep(clickedIndex, nextLineIndex);
                        } else {
                            this.activateStep(clickedIndex, 0);
                        }
                    } else {
                        this.activateStep(clickedIndex, 0);
                    }
                });
                
                $('.how-progress-step').each((stepIndex, step) => {
                    $(step).find('.how-progress-step-item').on('click', (e) => {
                        e.stopPropagation();
                        const clickedItemIndex = $(step).find('.how-progress-step-item').index($(e.currentTarget));
                        this.activateStep(stepIndex, clickedItemIndex);
                    });
                });
            }
            
            interactMobile() {
                $('.how-progress-tab-item').on('click', (e) => {
                    e.stopPropagation();
                    const $clickedTab = $(e.currentTarget);
                    const clickedIndex = $('.how-progress-tab-item').index($clickedTab);
                    
                    if($clickedTab.hasClass('active')) {
                        const $activeLines = $clickedTab.find('.how-progress-tab-item-line.active');
                        const $allLines = $clickedTab.find('.how-progress-tab-item-line');
                        
                        if($activeLines.length > 0) {
                            const currentLineIndex = $allLines.index($activeLines.eq(0));
                            const nextLineIndex = (currentLineIndex + 1) % $allLines.length;
                            this.activateStep(clickedIndex, nextLineIndex);
                        } else {
                            this.activateStep(clickedIndex, 0);
                        }
                    } else {
                        this.activateStep(clickedIndex, 0);
                    }
                });
                
                $('.how-progress-step').each((stepIndex, step) => {
                    $(step).find('.how-progress-step-item').on('click', function(e) {
                        e.stopPropagation();
                        const $item = $(this);
                        const itemIndex = $(step).find('.how-progress-step-item').index($item);
                        
                        if (!$item.hasClass('active')) {
                            this.activateStep(stepIndex, itemIndex);
                        } else {
                            $item.removeClass('active');
                            $item.find('.how-progress-step-item-img').slideUp();
                            $('.how-progress-tab-item').eq(stepIndex).find('.how-progress-tab-item-line').eq(itemIndex).removeClass('active');
                        }
                    }.bind(this));
                });
            }
            
            destroy() {
                if (this.swiper) {
                    this.swiper.destroy(true, true);
                    this.swiper = null;
                }
                $('.how-progress-tab-item').off('click');
                $('.how-progress-step-item').off('click');
                super.destroy();
            }
        },
        'how-work-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                };
            }
            animationReveal() {
            }
            initSwiper() {
                $('.how-work-cms').addClass('swiper');
                $('.how-work-main').addClass('swiper-wrapper');
                $('.how-work-item').addClass('swiper-slide');
                let swiper = new Swiper('.how-work-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.how-work-pagi',
                        bulletClass: 'how-work-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,  
                      },
                });
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'fea-complete-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    if(viewport.w < 992) {
                        this.initSwiper();
                    }
                    this.animationReveal();
                };
            }
            animationReveal() {
            }
            initSwiper() {
                $('.fea-complete-main').addClass('swiper');
                $('.fea-complete-inner').addClass('swiper-wrapper');
                $('.fea-complete-item').addClass('swiper-slide');
                let swiper = new Swiper('.fea-complete-main', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.fea-complete-pagi',
                        bulletClass: 'fea-complete-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,  
                      },
                });
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
    }
    class PageManager {
        constructor(page) {
            if (!page || typeof page !== 'object') {
                throw new Error('Invalid page configuration');
            }
            // Store registered component names to prevent duplicate registration
            this.registeredComponents = new Set();

            this.sections = Object.entries(page).map(([name, Component]) => {
                if (typeof Component !== 'function') {
                    throw new Error(`Section "${name}" must be a class constructor`);
                }

                // Only register the custom element if not already registered
                if (!this.registeredComponents.has(name)) {
                    try {
                        customElements.define(name, Component);
                        this.registeredComponents.add(name);
                    } catch (error) {
                        // Handle case where element is already defined
                        console.warn(`Custom element "${name}" is already registered`);
                    }
                }

                return new Component();
            });
        }

        // Method to cleanup sections if needed
        destroy() {
            this.sections.forEach(section => {
                if (typeof section.destroy === 'function') {
                    section.destroy();
                }
            });
        }
    }
    const pageName = $('.main-inner').attr('data-namespace');
    const pageConfig = {
        home: HomePage,
        faq: FaqPage,
        comparison: ComparisonPage,
        schedule: SchedulePage,
        contact: ContactPage,
        growth: GrowthPage,
        stories: StoriesPage,
        growthCategory: GrowthCategoryPage,
        pricing: PricingPage,
        result: ResultPage,
        eventDetail: EventDetailPage,
        videoDetail: VideoDetailPage,
        guideDetail: GuideDetailPage,
        articleDetail: ArticleDetailPage,
        about: AboutPage,
        summit: SummitPage,
        featured: FeaturedPage,
        howItWork: howItWorkPage,
    };
    if(!isTouchDevice() && viewport.w >= 992) {
        cursor.updateHtml();
        cursor.init();
    }
    const registry = {};
    registry[pageName]?.destroy();

    documentHeightObserver("init");
    refreshOnBreakpoint();
    scrollTop(() => pageConfig[pageName] && (registry[pageName] = new PageManager(pageConfig[pageName])));
}
window.onload = script;
