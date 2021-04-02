/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { which } from 'shelljs';
import { Env, set, keyBy } from '@salesforce/kit';
import { get, getString, isString } from '@salesforce/ts-types';

const env = new Env();

/**
 * The executables we want to test against. These can be toggled with environment variables
 */
export const EXECUTABLES = [
  {
    path: which('sfdx').stdout, // the full path to the sfdx executable
    skip: !env.getBoolean('PLUGIN_SOURCE_TEST_SFDX', true),
  },
  {
    path: path.join(process.cwd(), 'bin', 'run'), // path to the plugin's bin/run executable
    skip: !env.getBoolean('PLUGIN_SOURCE_TEST_BIN_RUN', false),
  },
];

/**
 * The repositories we want to test against. See the type definition for explanation
 * of the configuration options.
 */
const testRepos: RepoConfig[] = [
  {
    skip: false,
    gitUrl: 'https://github.com/salesforcecli/sample-project-multiple-packages.git',
    deploy: {
      sourcepath: [
        { toDeploy: 'force-app,my-app', toVerify: ['force-app/**/*', 'my-app/**/*'] },
        { toDeploy: '"force-app, my-app, foo-bar"', toVerify: ['force-app/**/*', 'my-app/**/*', 'foo-bar/**/*'] },
        { toDeploy: 'force-app/main/default/objects', toVerify: ['force-app/main/default/objects/**/*'] },
        { toDeploy: 'my-app/objects', toVerify: ['my-app/objects/**/*'] },
        { toDeploy: 'my-app/apex/my.cls-meta.xml', toVerify: ['my-app/apex/my.cls-meta.xml'] },
        { toDeploy: 'foo-bar/app/lwc', toVerify: ['foo-bar/app/lwc/**/*'] },
      ],
      metadata: [
        { toDeploy: 'CustomObject', toVerify: ['force-app/main/default/objects/*__c/*', 'my-app/objects/*__c/*'] },
        {
          toDeploy: 'CustomLabels',
          toVerify: [
            'force-app/main/default/labels/CustomLabels.labels-meta.xml',
            'my-app/labels/CustomLabels.labels-meta.xml',
          ],
        },
      ],
      manifest: [
        { toDeploy: 'force-app', toVerify: ['force-app/**/*'] },
        { toDeploy: 'my-app', toVerify: ['my-app/**/*'] },
        { toDeploy: 'foo-bar', toVerify: ['foo-bar/**/*'] },
        { toDeploy: 'force-app,my-app,foo-bar', toVerify: ['force-app/**/*', 'my-app/**/*', 'foo-bar/**/*'] },
      ],
      testlevel: { specifiedTests: ['MyTest'] },
    },
    retrieve: {
      sourcepath: [
        { toRetrieve: 'force-app,my-app,foo-bar', toVerify: ['force-app/**/*', 'my-app/**/*', 'foo-bar/**/*'] },
        { toRetrieve: '"force-app, my-app, foo-bar"', toVerify: ['force-app/**/*', 'my-app/**/*', 'foo-bar/**/*'] },
        { toRetrieve: 'force-app/main/default/objects', toVerify: ['force-app/main/default/objects/*__c/*'] },
        { toRetrieve: 'my-app/objects', toVerify: ['my-app/objects/*__c/fields/*'] },
        { toRetrieve: 'my-app/apex/my.cls-meta.xml', toVerify: ['my-app/apex/my.cls-meta.xml'] },
        { toRetrieve: 'foo-bar/app/lwc', toVerify: ['foo-bar/app/lwc/**/*'] },
      ],
      metadata: [
        {
          toRetrieve: 'CustomObject',
          toVerify: ['force-app/main/default/objects/*__c/*', 'my-app/objects/*__c/*'],
        },
        {
          toRetrieve: 'CustomLabels',
          toVerify: [
            'force-app/main/default/labels/CustomLabels.labels-meta.xml',
            'my-app/labels/CustomLabels.labels-meta.xml',
          ],
        },
      ],
      manifest: [
        { toRetrieve: 'force-app', toVerify: ['force-app/**/*'] },
        { toRetrieve: 'my-app', toVerify: ['my-app/**/*'] },
        { toRetrieve: 'force-app,my-app,foo-bar', toVerify: ['force-app/**/*', 'my-app/**/*', 'foo-bar/**/*'] },
      ],
    },
    convert: {
      sourcepath: [
        { toConvert: 'force-app,my-app', toVerify: ['**/force.cls', '**/my.cls'] },
        { toConvert: '"force-app, my-app"', toVerify: ['**/force.cls', '**/my.cls'] },
        { toConvert: 'force-app/main/default/objects', toVerify: ['objects/MyObj__c.object'] },
        { toConvert: 'my-app/objects', toVerify: ['objects/MyObj__c.object'] },
        { toConvert: 'my-app/apex/my.cls-meta.xml', toVerify: ['**/my.cls-meta.xml'] },
      ],
      metadata: [{ toConvert: 'CustomObject', toVerify: ['objects/MyObj__c.object'] }],
      manifest: [
        { toConvert: 'force-app', toVerify: ['**/force.cls'] },
        { toConvert: 'my-app', toVerify: ['**/my.cls'] },
        { toConvert: 'force-app,my-app', toVerify: ['**/force.cls', '**/my.cls'] },
      ],
    },
  },
  {
    skip: false,
    gitUrl: 'https://github.com/trailheadapps/dreamhouse-sfdx.git',
    deploy: {
      sourcepath: [
        { toDeploy: 'force-app', toVerify: ['force-app/main/default/**/*'] },
        { toDeploy: 'force-app/main/default/classes', toVerify: ['force-app/main/default/classes/**/*'] },
        {
          toDeploy: 'force-app/main/default/classes,force-app/main/default/objects',
          toVerify: ['force-app/main/default/classes/*', 'force-app/main/default/objects/**/*'],
        },
        {
          toDeploy: '"force-app/main/default/classes, force-app/main/default/permissionsets"',
          toVerify: ['force-app/main/default/classes/*', 'force-app/main/default/permissionsets/*'],
        },
        {
          toDeploy: 'force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml',
          toVerify: ['force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml'],
        },
      ],
      metadata: [
        { toDeploy: 'ApexClass', toVerify: ['force-app/main/default/classes/*'] },
        {
          toDeploy: 'CustomObject:Bot_Command__c',
          toVerify: ['force-app/main/default/objects/Bot_Command__c/*'],
        },
        {
          toDeploy: 'ApexClass,CustomObject:Bot_Command__c',
          toVerify: ['force-app/main/default/classes/*', 'force-app/main/default/objects/Bot_Command__c/*'],
        },
        {
          toDeploy: 'ApexClass:BotController,CustomObject',
          toVerify: ['force-app/main/default/classes/BotController.cls', 'force-app/main/default/objects/*'],
        },
        {
          toDeploy: '"ApexClass:BotController, CustomObject, PermissionSet"',
          toVerify: [
            'force-app/main/default/classes/BotController.cls',
            'force-app/main/default/objects/*',
            'force-app/main/default/permissionsets/*',
          ],
        },
      ],
      manifest: [
        { toDeploy: 'force-app', toVerify: ['force-app/**/*'] },
        {
          toDeploy: 'force-app/main/default/classes,force-app/main/default/objects',
          toVerify: ['force-app/main/default/classes/*', 'force-app/main/default/objects/*'],
        },
        {
          toDeploy:
            '"force-app/main/default/objects, force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml"',
          toVerify: [
            'force-app/main/default/objects/*',
            'force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml',
          ],
        },
      ],
      testlevel: { specifiedTests: ['BotTest'] },
    },
    retrieve: {
      sourcepath: [
        { toRetrieve: 'force-app', toVerify: ['force-app/**/*'] },
        { toRetrieve: 'force-app/main/default/classes', toVerify: ['force-app/main/default/classes/*'] },
        {
          toRetrieve: 'force-app/main/default/classes,force-app/main/default/objects',
          toVerify: ['force-app/main/default/classes/*', 'force-app/main/default/objects/*__c/*'],
        },
        {
          toRetrieve: '"force-app/main/default/classes, force-app/main/default/permissionsets"',
          toVerify: ['force-app/main/default/classes/*', 'force-app/main/default/permissionsets/*'],
        },
        {
          toRetrieve: 'force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml',
          toVerify: ['force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml'],
        },
      ],
      metadata: [
        { toRetrieve: 'ApexClass', toVerify: ['force-app/main/default/classes/*'] },
        {
          toRetrieve: 'CustomObject:Bot_Command__c',
          toVerify: ['force-app/main/default/objects/Bot_Command__c/*'],
        },
        {
          toRetrieve: 'ApexClass,CustomObject:Bot_Command__c',
          toVerify: ['force-app/main/default/classes/*', 'force-app/main/default/objects/Bot_Command__c/*'],
        },
        {
          toRetrieve: 'ApexClass:BotController,CustomObject',
          toVerify: ['force-app/main/default/classes/BotController.cls', 'force-app/main/default/objects/*__c/*'],
        },
        {
          toRetrieve: '"ApexClass:BotController, CustomObject, PermissionSet"',
          toVerify: [
            'force-app/main/default/classes/BotController.cls',
            'force-app/main/default/objects/*__c/*',
            'force-app/main/default/permissionsets/*',
          ],
        },
      ],
      manifest: [
        { toRetrieve: 'force-app', toVerify: ['force-app/**/*'] },
        {
          toRetrieve: 'force-app/main/default/classes,force-app/main/default/objects',
          toVerify: ['force-app/main/default/classes/*', 'force-app/main/default/objects/*'],
        },
        {
          toRetrieve:
            '"force-app/main/default/objects, force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml"',
          toVerify: [
            'force-app/main/default/objects/*',
            'force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml',
          ],
        },
      ],
    },
    convert: {
      sourcepath: [
        { toConvert: 'force-app', toVerify: ['**/*'] },
        { toConvert: 'force-app/main/default/classes', toVerify: ['classes/*'] },
        {
          toConvert: 'force-app/main/default/classes,force-app/main/default/objects',
          toVerify: ['classes/*', 'objects/*'],
        },
        {
          toConvert: '"force-app/main/default/classes, force-app/main/default/permissionsets"',
          toVerify: ['classes/*', 'permissionsets/*'],
        },
        {
          toConvert: 'force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml',
          toVerify: ['permissionsets/dreamhouse.permissionset'],
        },
      ],
      metadata: [
        { toConvert: 'ApexClass', toVerify: ['classes/*'] },
        {
          toConvert: 'CustomObject:Bot_Command__c',
          toVerify: ['objects/Bot_Command__c.object'],
        },
        {
          toConvert: 'ApexClass,CustomObject:Bot_Command__c',
          toVerify: ['classes/*', 'objects/Bot_Command__c.object'],
        },
        {
          toConvert: 'ApexClass:BotController,CustomObject',
          toVerify: ['classes/BotController.cls', 'objects/*__c.object'],
        },
        {
          toConvert: '"ApexClass:BotController, CustomObject, PermissionSet"',
          toVerify: ['classes/BotController.cls', 'objects/*__c.object', 'permissionsets/*'],
        },
      ],
      manifest: [
        { toConvert: 'force-app', toVerify: ['f**/*'] },
        {
          toConvert: 'force-app/main/default/classes,force-app/main/default/objects',
          toVerify: ['classes/*', 'objects/*'],
        },
        {
          toConvert:
            '"force-app/main/default/objects, force-app/main/default/permissionsets/dreamhouse.permissionset-meta.xml"',
          toVerify: ['objects/*', 'permissionsets/dreamhouse.permissionset'],
        },
      ],
    },
  },
];

/**
 * We want to export a map of the repo configs that:
 * 1. are keyed by the gitUrl
 * 2. have normalized file paths
 */
export const TEST_REPOS_MAP = new Map<string, RepoConfig>(
  Object.entries(keyBy(normalizeFilePaths(testRepos), 'gitUrl'))
);

export type RepoConfig = {
  skip?: boolean; // determines if the repository should be skipped during nut generation
  gitUrl: string; // the git url used for cloning the repository
  deploy: {
    metadata: DeployTestCase[];
    sourcepath: DeployTestCase[];
    manifest: DeployTestCase[];
    testlevel: { specifiedTests: string[] }; // the apex test to be executed for the RunSpecificTest flag test
  };
  retrieve: {
    metadata: RetrieveTestCase[];
    sourcepath: RetrieveTestCase[];
    manifest: RetrieveTestCase[];
  };
  convert: {
    metadata: ConvertTestCase[];
    sourcepath: ConvertTestCase[];
    manifest: ConvertTestCase[];
  };
};

type DeployTestCase = {
  toDeploy: string; // the string to be passed into the source:deploy command execution. Do not include the flag name (e.g. --sourcepath)
  toVerify: GlobPattern[]; // the glob patterns used to determine if the expected source files were deployed to the org
};

type RetrieveTestCase = {
  toRetrieve: string; // the string to be passed into the source:retrieve command execution. Do not include the flag name (e.g. --sourcepath)
  toVerify: GlobPattern[]; // the glob patterns used to determine if the expected source files were retrieved from the org
};

type ConvertTestCase = {
  toConvert: string; // the string to be passed into the source:convert command execution. Do not include the flag name (e.g. --sourcepath)
  toVerify: GlobPattern[]; // the glob patterns used to determine if the expected source files were converted. NOTE: this is relative to the converted output dir
};

type TestCase = DeployTestCase & RetrieveTestCase & ConvertTestCase;

type GlobPattern = string; // see: https://github.com/mrmlnc/fast-glob#pattern-syntax

function normalizeFilePaths(repos: RepoConfig[]): RepoConfig[] {
  const pathsToNormalize = [
    'retrieve.manifest',
    'retrieve.metadata',
    'retrieve.sourcepath',
    'deploy.manifest',
    'deploy.metadata',
    'deploy.sourcepath',
  ];
  for (const repo of repos) {
    for (const p of pathsToNormalize) {
      const testCases = get(repo, p) as TestCase[];
      for (const testCase of testCases) {
        for (const key of Object.keys(testCase)) {
          const value = getString(testCase, key);
          if (isString(value)) {
            const normalized = value.split(',').map(normalize).join(',');
            set(testRepos, `${p}.${key}`, normalized);
          }
        }
      }
    }
  }
  return repos;
}

function normalize(filePath: string) {
  return path.join(...filePath.split('/'));
}