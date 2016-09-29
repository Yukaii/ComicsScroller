import {
	Component,
	PropTypes
} from 'react';
import { connect } from 'react-redux';
import Radium from 'radium';

import { grey800, grey50, grey500 } from 'material-ui/styles/colors';

import Icon from 'components/Icon';

import * as t from 'constants/ActionTypes';

import { comicManagers } from 'services';

const styles = {
	iconStyle: {
		fontSize: '1.8em',
		verticalAlign: 'middle',
		margin: '20% auto',
		color: grey500,
		cursor: 'pointer'
	},
	iconHighlighted: {
		color: 'white'
	},
	menuItem: {color: grey50, paddingLeft: 10, lineHeight: '60px'},
	seperator: {
		color: grey500,
		border: 'solid 0.5px',
		borderBottomWidth: '0px'
	},
	navigationSidebar: {
		position: 'fixed',
		height: '100%',
		width: 60,
		left: 0,
		backgroundColor: grey800,
		display: 'flex',
		paddingTop: '1em',
		flexDirection: 'column',
		zIndex: 9999
	}
};

@Radium
class NavigationSidebar extends Component {
	static propTypes = {
		/* injected by redux */
		drawerOpen: PropTypes.bool,
		readingCID: PropTypes.string,
		dispatch: PropTypes.func,

		highlightTag: PropTypes.string
	}

	navigateTo = (pathname) => {
		return () => {
			this.props.dispatch({type: t.NAVIGATE, pathname: pathname});
		};
	}

	onRequestChange = (drawerOpen) => {
		const { dispatch } = this.props;
		dispatch({type: t.CHANGE_DRAWER_STATE, drawerOpen});
	}

	highlightStyle = (tag) => {
		const { highlightTag } = this.props;

		return tag === highlightTag ? styles.iconHighlighted : null;
	}

	render() {
		const { readingCID } = this.props;

		return(
			<div style={styles.navigationSidebar}>
				{
					(typeof readingCID !== 'undefined' && readingCID) ?
						<Icon
							iconName="insert_photo"
							style={[styles.iconStyle, this.highlightStyle('reader')]}
							onClick={this.navigateTo(`/reader/dm5/${comicManagers.dm5.getChapterID(readingCID)}`)}
						/> :
						<Icon
							iconName="insert_photo"
							style={[styles.iconStyle, this.highlightStyle('reader')]}
						/>
				}
				<Icon
					iconName="search"
					style={[styles.iconStyle, this.highlightStyle('search')]}
					onClick={this.navigateTo('/explore')}
				/>
				<Icon
					iconName="library_books"
					style={[styles.iconStyle, this.highlightStyle('collection')]}
					onClick={this.navigateTo('/collection?tab=collection')}
				/>
				<Icon iconName="info" style={styles.iconStyle} />
			</div>
		);
	}
}

export default connect(state => {
	return({
		readingCID: state.comics.readingCID
	});
})(NavigationSidebar);
