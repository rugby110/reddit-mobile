import React from 'react';
import BaseComponent from '../components/BaseComponent';
import LiveReload from '../components/LiveReload';

class DefaultLayout extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render () {
    var assetPath = this.props.config.assetPath;
    var manifest = this.props.config.manifest;

    var baseCSS = assetPath + '/css/';
    var clientJS = assetPath + '/js/';

    var liveReload;
    if (this.props.config.liveReload) {
      liveReload = (<LiveReload />);
    }

    if (this.props.config.minifyAssets) {
      baseCSS += manifest['base.css'];
      clientJS += manifest['client.min.js'];
    } else {
      baseCSS += 'base.css';
      clientJS += 'client.js';
    }

    var canonical;

    if (this.props.config.url) {
      canonical = (
        <link rel='canonical' href={ `${this.props.config.reddit}${this.props.ctx.url}` } />
      );
    }

    var metaDescription;

    if (this.props.metaDescription) {
      metaDescription = (
        <meta name='description' content={ this.props.metaDescription } />
      );
    }

    var gaTracking;

    if (this.props.propertyId) {
      let propertyId = this.props.propertyId;

      let trackingCode = `
        <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', '${propertyId}', 'auto', {'sampleRate': 50});
        ga('send', 'pageview');
        </script>
      `;

      gaTracking = (
        <div dangerouslySetInnerHTML={{ __html: trackingCode }} />
      );
    }

    return (
      <html>
        <head>
          <title>{ this.props.title }</title>
          <link href={ baseCSS } rel='stylesheet' />
          { canonical }

          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
          <meta name='theme-color' content='#336699' />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta id='csrf-token-meta-tag' name='csrf-token' content={ this.props.csrf } />
          { metaDescription }

          <link href={ `${assetPath}/favicon/64x64.png` } rel="icon shortcut" sizes="64x64" />
          <link href={ `${assetPath}/favicon/128x128.png` } rel="icon shortcut" sizes="128x128" />
          <link href={ `${assetPath}/favicon/192x192.png` } rel="icon shortcut" sizes="192x192" />
          <link href={ `${assetPath}/favicon/76x76.png` } rel="apple-touch-icon" sizes="76x76" />
          <link href={ `${assetPath}/favicon/120x120.png` } rel="apple-touch-icon" sizes="120x120" />
          <link href={ `${assetPath}/favicon/152x152.png` } rel="apple-touch-icon" sizes="152x152" />
          <link href={ `${assetPath}/favicon/180x180.png` } rel="apple-touch-icon" sizes="180x180" />
        </head>
        <body className='navbar-offcanvas-target'>
          <div id='app-container'>
            !!CONTENT!!
          </div>

          <script src={ clientJS } async='true'></script>
          { liveReload }
          { gaTracking }
        </body>
      </html>
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
DefaultLayout.propTypes = {
  metaDescription: React.PropTypes.string,
  propertyId: React.PropTypes.string,
  title: React.PropTypes.string.isRequired,
};

export default DefaultLayout;
