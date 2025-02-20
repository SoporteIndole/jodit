/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import type { Variables } from '../variables';
import type { WebpackConfiguration } from 'webpack-cli';
import * as webpack from 'webpack';
import define from './define';
import extractCSS from './extract-css';
import banner from './banner';
import postBuild from './post-build';

export const plugins = (vars: Variables): WebpackConfiguration['plugins'] => {
	const {
		isProd,
		isTest,
		ESModern,
		onlyTS,
		debug,
		exclude,
		progressFunction
	} = vars;

	const plugins: Array<webpack.ProgressPlugin | webpack.DelegatedPlugin> = [
		define(vars)
	];

	plugins.push(
		new webpack.ProgressPlugin(
			progressFunction ? progressFunction : undefined
		)
	);

	if (isProd) {
		if (!onlyTS) {
			plugins.push(extractCSS(vars));
		}

		plugins.push(banner(vars));

		if (!isTest && !ESModern && !onlyTS) {
			plugins.push(postBuild(vars));
		}
	}

	if (!debug) {
		plugins.push(
			new webpack.ids.DeterministicModuleIdsPlugin({
				maxLength: 5
			})
		);
	}

	plugins.push(
		new webpack.IgnorePlugin({
			checkResource(resource: string): boolean {
				if (exclude.length) {
					for (const p of exclude) {
						if (p.length && resource.includes(p)) {
							console.log('\nExclude:', resource, ' rule: ', p);
							return true;
						}
					}
				}

				return false;
			}
		})
	);

	return plugins;
};
