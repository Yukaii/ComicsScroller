var React = require('react'),
  // AutoPrefix = require('material-ui').Styles.AutoPrefix,
  Transitions = require('material-ui/styles/transitions'),
  Overlay = require('material-ui').Overlay,
  Paper = require('material-ui').Paper,
  Menu = require('./menu.jsx');

var PureRenderMixin = require('react-addons-pure-render-mixin');

var keycode = require('keycode');

var LeftNav = React.createClass({
  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    className: React.PropTypes.string,
    docked: React.PropTypes.bool,
    header: React.PropTypes.element,
    onChange: React.PropTypes.func,
    selectedIndex: React.PropTypes.number,
    openRight: React.PropTypes.bool,
    onNavOpen: React.PropTypes.func,
    onNavClose: React.PropTypes.func
  },

  windowListeners: {
    'keyup': '_onWindowKeyUp',
    'resize': '_onWindowResize'
  },

  getDefaultProps: function() {
    return {
      docked: true
    };
  },

  getInitialState: function() {
    return {
      open: this.props.docked,
      maybeSwiping: false,
      swiping: false
    };
  },

  componentDidMount: function() {
    this._updateMenuHeight();
    this._enableSwipeHandling();
  },

  componentDidUpdate: function(prevProps, prevState) {
    this._updateMenuHeight();
    this._enableSwipeHandling();
  },

  componentWillUnmount: function() {
    this._disableSwipeHandling();
  },

  toggle: function() {
    this.setState({ open: !this.state.open });
    return this;
  },

  close: function() {
    this.setState({ open: false });
    if (this.props.onNavClose) this.props.onNavClose();
    return this;
  },

  open: function() {
    this.setState({ open: true });
    if (this.props.onNavOpen) this.props.onNavOpen();
    return this;
  },

  getThemePalette: function() {
    return this.context.muiTheme.palette;
  },

  getTheme: function() {
    return this.context.muiTheme.component.leftNav;
  },

  getStyles: function() {
    var x = this._getTranslateMultiplier() * (this.state.open ? 0 : this._getMaxTranslateX()) + 'px';
    var styles = {
      root: {
        height: '100%',
        width: this.getTheme().width,
        position: 'fixed',
        zIndex: 10,
        left: 0,
        top: 0,
        transform: 'translate3d(' + x + ', 0, 0)',
        transition: !this.state.swiping && Transitions.easeOut(),
        backgroundColor: this.getTheme().color,
        overflow: 'hidden'
      },
      menu: {
        overflowY: 'auto',
        overflowX: 'hidden',
        height: '100%'
      },
      menuItem: {
        height: 'auto',
        lineDeight: this.context.muiTheme.spacing.desktopLeftNavMenuItemHeight
      },
      rootWhenOpenRight: {
        left: 'auto',
        right: '0'
      }
    };
    styles.menuItemLink = Object.assign({}, styles.menuItem, {
      display: 'block',
      textDecoration: 'none',
      color: this.getThemePalette().textColor
    });
    styles.menuItemSubheader = Object.assign({}, styles.menuItem, {
      overflow: 'hidden'
    });

    return styles;
  },

  render: function() {
    var selectedIndex = this.props.selectedIndex,
      overlay;

    var styles = this.getStyles();
    if (!this.props.docked) {
      overlay = <Overlay ref="overlay"
                         show={this.state.open}
                         transitionEnabled={!this.state.swiping}
                         onTouchTap={this._onOverlayTouchTap} />;
    }

    return (
      <div className={this.props.className}>
        {overlay}
        <Paper
          ref="clickAwayableElement"
          zDepth={2}
          transitionEnabled={!this.state.swiping}
          rounded={false}
          style={Object.assign({},
            styles.root,
            this.props.openRight && styles.rootWhenOpenRight,
            this.props.style)}>
          {this.props.header}
          <Menu
            ref="menuItems"
            style={Object.assign({}, styles.menu)}
            zDepth={0}
            menuItems={this.props.menuItems}
            menuItemStyle={Object.assign({}, styles.menuItem)}
            menuItemStyleLink={Object.assign({}, styles.menuItemLink)}
            menuItemStyleSubheader={Object.assign({}, styles.menuItemSubheader)}
            selectedIndex={selectedIndex}
            onItemClick={this._onMenuItemClick} />
        </Paper>
      </div>
    );


  },

  _updateMenuHeight: function() {
    if (this.props.header) {
      var container = React.findDOMNode(this.refs.clickAwayableElement);
      var menu = React.findDOMNode(this.refs.menuItems);
      var menuHeight = container.clientHeight - menu.offsetTop;
      menu.style.height = menuHeight + 'px';
    }
  },

  _onMenuItemClick: function(e, key, payload) {
    if (this.props.onChange && this.props.selectedIndex !== key) {
      this.props.onChange(e, key, payload);
    }
    if (!this.props.docked) this.close();
  },

  _onOverlayTouchTap: function() {
    this.close();
  },

  _onWindowKeyUp: function(e) {
    if (e.keyCode == keycode('ESC') &&
        !this.props.docked &&
        this.state.open) {
      this.close();
    }
  },

  _onWindowResize: function(e) {
    this._updateMenuHeight();
  },

  _getMaxTranslateX: function() {
    return this.getTheme().width + 10;
  },

  _getTranslateMultiplier: function() {
    return this.props.openRight ? 1 : -1;
  },

  _enableSwipeHandling: function() {
    if (this.state.open && !this.props.docked) {
      document.body.addEventListener('touchstart', this._onBodyTouchStart);
    } else {
      this._disableSwipeHandling();
    }
  },

  _disableSwipeHandling: function() {
    document.body.removeEventListener('touchstart', this._onBodyTouchStart);
  },

  _onBodyTouchStart: function(e) {
    var touchStartX = e.touches[0].pageX;
    var touchStartY = e.touches[0].pageY;
    this.setState({
      maybeSwiping: true,
      touchStartX: touchStartX,
      touchStartY: touchStartY
    });

    document.body.addEventListener('touchmove', this._onBodyTouchMove);
    document.body.addEventListener('touchend', this._onBodyTouchEnd);
    document.body.addEventListener('touchcancel', this._onBodyTouchEnd);
  },

  _onBodyTouchMove: function(e) {
    var currentX = e.touches[0].pageX;
    var currentY = e.touches[0].pageY;

    if (this.state.swiping) {
      e.preventDefault();
      var translateX = Math.min(
                         Math.max(
                           this._getTranslateMultiplier() * (currentX - this.state.swipeStartX),
                           0
                         ),
                         this._getMaxTranslateX()
                       );

      var leftNav = React.findDOMNode(this.refs.clickAwayableElement);
      // commented temporily because of removal of autoprefix
      // leftNav.style[AutoPrefix.single('transform')] = 'translate3d(' + (this._getTranslateMultiplier() * translateX) + 'px, 0, 0)';
      this.refs.overlay.setOpacity(1 - translateX / this._getMaxTranslateX());
    } else if (this.state.maybeSwiping) {
      var dXAbs = Math.abs(currentX - this.state.touchStartX);
      var dYAbs = Math.abs(currentY - this.state.touchStartY);
      // If the user has moved his thumb ten pixels in either direction,
      // we can safely make an assumption about whether he was intending
      // to swipe or scroll.
      var threshold = 10;

      if (dXAbs > threshold && dYAbs <= threshold) {
        this.setState({
          swiping: true,
          swipeStartX: currentX
        });
      } else if (dXAbs <= threshold && dYAbs > threshold) {
        this._onBodyTouchEnd();
      }
    }
  },

  _onBodyTouchEnd: function() {
    var shouldClose = false;

    if (this.state.swiping) shouldClose = true;

    this.setState({
      maybeSwiping: false,
      swiping: false
    });

    // We have to call close() after setting swiping to false,
    // because only then CSS transition is enabled.
    if (shouldClose) this.close();

    document.body.removeEventListener('touchmove', this._onBodyTouchMove);
    document.body.removeEventListener('touchend', this._onBodyTouchEnd);
    document.body.removeEventListener('touchcancel', this._onBodyTouchEnd);
  }


});

module.exports = LeftNav;
