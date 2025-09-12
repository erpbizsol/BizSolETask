(function(){
	var key = 'theme-preference';
	function apply(theme){
		if(theme !== 'light' && theme !== 'dark') theme = 'dark';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem(key, theme);
	}
	function init(){
		var saved = localStorage.getItem(key);
		if(!saved){
			var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
			apply(prefersDark ? 'dark' : 'light');
		} else {
			apply(saved);
		}
		var btn = document.getElementById('themeToggle');
		if(btn){
			btn.addEventListener('click', function(){
				var current = document.documentElement.getAttribute('data-theme') || 'dark';
				apply(current === 'dark' ? 'light' : 'dark');
			});
		}
	}
	if(document.readyState === 'loading'){
		document.addEventListener('DOMContentLoaded', init);
	}else{
		init();
	}
})();


