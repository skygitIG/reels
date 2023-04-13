jQuery('.wrapper').mousemove(function (e) {
	jQuery('.then').css('width', e.pageX - this.offsetLeft);
});