import { CracoConfig } from '@craco/types';
import path from 'path';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { addPlugins, removePlugins, pluginByName } from '@craco/craco';
import dotenv from 'dotenv';

function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

const config: CracoConfig = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      //
      if (env !== 'production' || !paths) return webpackConfig;

      const appTemplateFileName = dotenv.config({ path: paths.dotenv }).parsed?.APP_PHP || 'index.html';
      const match = /\.(\w+)$/.exec(appTemplateFileName);
      const fileExtension = match && match[1] && match[1].toLowerCase();
      if (!fileExtension) {
        throw new Error(`Unknown template type. ${appTemplateFileName} `);
      }
      const appTemplatePath = path.resolve(paths.appPublic, appTemplateFileName);
      if (!fs.existsSync(appTemplatePath)) {
        throw new Error(`No template ${appTemplatePath} found.`);
      }
      paths.appHtml = appTemplatePath;
      if (['html', 'js', 'mjs', 'jsx', 'ts', 'tsx', 'json'].includes(fileExtension)) {
        return webpackConfig;
      }

      removePlugins(webpackConfig, pluginByName('HtmlWebpackPlugin'));
      addPlugins(webpackConfig, [
        new HtmlWebpackPlugin({
          inject: false,
          template: appTemplatePath,
          minify: false,
          filename: appTemplateFileName,
          alwaysWriteToDisk: true,
        }),
      ]);
      webpackConfig.module?.rules?.forEach(rule => {
        if (isObject(rule) && Array.isArray(rule.oneOf)) {
          rule.oneOf.forEach(oneOfRule => {
            if (isObject(rule) && oneOfRule.type === 'asset/resource' && Array.isArray(oneOfRule.exclude)) {
              oneOfRule.exclude.push(new RegExp(`\\.${fileExtension}$`));
            }
          });
        }
      });
      return webpackConfig;
    },
  },
};

export default config;