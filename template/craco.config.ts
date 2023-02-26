import { CracoConfig } from "@craco/types";
import path from "path";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { pluginByName, getPlugin } from "@craco/craco";
import dotenv from "dotenv";
const _ = require("lodash");

const config: CracoConfig = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env !== "production" || !paths) return webpackConfig;

      const appTemplateFileName =
        dotenv.config({ path: paths.dotenv }).parsed?.APP_TEMPLATE ||
        "index.html";
      const appTemplatePath = path.resolve(
        paths.appPublic,
        appTemplateFileName
      );
      const match = /\.(\w+)$/.exec(appTemplateFileName);
      const templateFileExtension = match && match[1] && match[1].toLowerCase();
      const appTargetFileName =
        dotenv.config({ path: paths.dotenv }).parsed?.APP_TARGET_FILENAME ||
        appTemplateFileName;

      if (!templateFileExtension) {
        throw new Error(`Unknown template type. ${appTemplateFileName} `);
      }

      if (!fs.existsSync(appTemplatePath)) {
        throw new Error(`No template ${appTemplatePath} found.`);
      }

      const { isFound, match: htmlPlugin } = getPlugin(
        webpackConfig,
        pluginByName("HtmlWebpackPlugin")
      );
      if (isFound && isHtmlWebpackPlugin(htmlPlugin)) {
        paths.appHtml = appTemplatePath;
        if (templateFileExtension === "html") {
          Object.assign(htmlPlugin.userOptions, {
            template: appTemplatePath,
            filename: appTargetFileName,
          });
        } else {
          htmlPlugin.userOptions = {
            inject: false,
            templateContent: ({ htmlWebpackPlugin }) => {
              const fileContent = fs.readFileSync(appTemplatePath, {
                encoding: "utf8",
                flag: "r",
              });
              if (templateFileExtension !== "html") {
                Object.assign(_.templateSettings, {
                  escape: /\/\*%-([\s\S]+?)%\*\//g,
                  evaluate: /\/\*%([\s\S]+?)%\*\//g,
                  interpolate: /\/\*%=([\s\S]+?)%\*\//g,
                });
              }
              return _.template(fileContent)({
                htmlWebpackPlugin,
              });
            },
            minify: false,
            filename: appTargetFileName,
            alwaysWriteToDisk: true,
          };
        }
      }
      return webpackConfig;
    },
  },
};

function isHtmlWebpackPlugin(value: unknown): value is HtmlWebpackPlugin {
  return value !== null && typeof value === "object" && "userOptions" in value;
}

export default config;
