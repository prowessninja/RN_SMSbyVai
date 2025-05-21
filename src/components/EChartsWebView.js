import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const EChartsWebView = ({ option }) => {
  const screenWidth = Dimensions.get('window').width;
  const chartHeight = 300; // You can tweak this or make it dynamic

  const echartsHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
          }
          #main {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div id="main"></div>
        <script>
          const chart = echarts.init(document.getElementById('main'));
          const option = ${JSON.stringify(option)};
          chart.setOption(option);
          window.addEventListener('resize', () => {
            chart.resize();
          });
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: echartsHtml }}
      javaScriptEnabled
      domStorageEnabled
      style={[styles.webview, { height: chartHeight, width: screenWidth }]}
      scrollEnabled={false}
      automaticallyAdjustContentInsets={false}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    backgroundColor: 'transparent',
  },
});

export default EChartsWebView;
