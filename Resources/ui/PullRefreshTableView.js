/**
 * @author Angela Deng
 */
var Zookee = require('Zookee');
function PullRefreshTableView(param, refreshFun, loadMore) {
	var tableView = Ti.UI.createTableView();
	var loading = false;
	var pulling = false;
	for (var key in param) {
		tableView[key] = param[key];
	}
	var tableHeader = Ti.UI.createView({
		backgroundImage : Zookee.ImageURL.Background,
		width : Ti.UI.FILL,
		height : Zookee[50]
	});

	var arrow = Ti.UI.createView({
		backgroundImage : Zookee.ImageURL.Party,
		width : Zookee[30],
		height : Zookee[30],
		left : Zookee[185],
		bottom : Zookee[10]
	});

	var actInd = Titanium.UI.createActivityIndicator({
		left : Zookee[185],
		bottom : 13,
		width : 30,
		height : 30,
		style : Ti.UI.iPhone.ActivityIndicatorStyle.DARK
	});

	tableHeader.add(arrow);
	tableHeader.add(actInd);
	if (!Zookee.isAndroid) {
		tableView.allowsSelection = true;
		tableView.headerPullView = tableHeader;
	}
	tableView.isLoading = function() {
		return loading;
	};
	tableView.startLoading = function() {
		loading = true;
	}
	var offset = 0;
	var lastDistance = 0;
	var firstRow = 0;

	tableView.addEventListener('scroll', function(e) {
		// no more parties
		if (!Zookee.isAndroid) {
			if (e.contentOffset.y <= -45.0 && !pulling && !loading) {
				var t = Ti.UI.create2DMatrix();
				t = t.rotate(-180);
				pulling = true;
				arrow.animate({
					transform : t,
					duration : 180
				});
				return;
			} else if (pulling && (e.contentOffset.y > -45.0 && e.contentOffset.y < 0) && !loading) {
				pulling = false;
				var t = Ti.UI.create2DMatrix();
				arrow.animate({
					transform : t,
					duration : 180
				});
				return;
			}
		}

		if (loadMore) {
			if (!Zookee.isAndroid) {
				offset = e.contentOffset.y;
				var height = e.size.height;
				var total = offset + height;
				var theEnd = e.contentSize.height;
				var distance = theEnd - total;

				// going down is the only time we dynamically load,
				// going up we can safely ignore -- note here that
				// the values will be negative so we do the opposite
				if (distance < lastDistance) {
					// adjust the % of rows scrolled before we decide to start fetching
					var nearEnd = theEnd * .75;

					if (!loading && (total >= nearEnd)) {
						loadMore.fun();
					}
				}
				lastDistance = distance;
			} else {
				firstRow = e.firstVisibleItem;
				if (!loading && e.firstVisibleItem > tableView.data[0].rows.length - 4) {
					loadMore.fun();
				}
			}
		}
	});

	if (!Zookee.isAndroid) {
		tableView.addEventListener('dragend', function(e) {
			if (pulling && !loading) {
				pulling = false;
				arrow.hide();
				actInd.show();
				tableView.setContentInsets({
					top : 50
				}, {
					animated : true
				});
				arrow.transform = Ti.UI.create2DMatrix();
				refreshFun();
			}
		});
	}

	tableView.finishLoading = function() {
		if (!Zookee.isAndroid) {
			tableView.setContentInsets({
				top : 0
			}, {
				animated : true
			});
			arrow.show();
			actInd.hide();
		}
		loading = false;
	}
	return tableView;
}

module.exports = PullRefreshTableView;
