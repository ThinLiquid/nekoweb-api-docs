import { watch } from 'fs';
import fs from 'fs/promises'
import { getReasonPhrase } from 'http-status-codes';

import * as marked from 'marked'
import { types } from './api';

const outputDir = './dist'
const htmlTemplate = await fs.readFile('./src/index.html', 'utf-8')

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'; // Example of Method type

interface IEndpoint {
  path: string;
  methods: Method[];
  headers?: Record<string, string>;
  parameters?: Record<string, { type: string; required: boolean; description: string; }>;

  description: string;
  extras?: { type: string; data: string; }[];
  tags: string[];

  examples?: { language: string, code: string }[];
  output?: Record<number, keyof typeof types>;
}

export interface IAPI {
  info: { title: string; description: string; };
  endpoints: IEndpoint[];
}

const createHeader = (api: IAPI) => `
  <h1>${api.info.title}</h1>
  ${marked.parse(api.info.description)}
`


const createEndpoint = (endpoint: IEndpoint) => `
  <h2 id="${endpoint.path.replace('/', '')}">${endpoint.path}</h2>
  ${marked.parse(endpoint.description)}

  <div class="methods">
    ${endpoint.methods.map(method => `
      <div class="method ${method.toLowerCase()}">${method}</div>
    `).join('')}
    ${endpoint.tags.length > 0 ? `<div class="vert"></div>` : ''}
    ${endpoint.tags.map(header => `
      <div class="tag">${header}</div>
    `).join('')}
  </div>

  ${endpoint.headers ? `<h3>Headers</h3>` : ''}
  ${Object.entries(endpoint.headers ?? {}).map(([key, value]) => `
    <div class="header">
      <code class="key">${key}</code>: <span class="value">${value}</span>
    </div>
  `).join('')}

  ${endpoint.parameters ? `<h3>Parameters</h3>` : ''}
  ${Object.entries(endpoint.parameters ?? {}).map(([key, value]) => `
    <div class="parameter">
      <code class="key">${key}</code>: <span class="value">${value.type}</span>${value.required ? '<span class="required">*</span>' : ''} - ${value.description}
    </div>
  `).join('')}

  ${(endpoint.extras ?? []).map(extra => `
      <blockquote class="${extra.type}">
        ${marked.parseInline(extra.data)}
      </blockquote>
  `).join('')}

  ${endpoint.examples ? `<h3>Examples</h3>` : ''}
  ${(endpoint.examples ?? []).map(example => `
    <details>
      <summary>${example.language}</summary>
      <pre><code>${example.code}</code></pre>
    </details>
  `).join('')}

  ${endpoint.output ? `<h3>Status Codes</h3>` : ''}
  ${(endpoint.output ? Object.entries(endpoint.output) : []).map(([key, value]) => `
    <details>
      <summary>${key} - ${getReasonPhrase(key)} (Type: ${value})</summary>
      <pre><code>${types[value]}</code></pre>
    </details>
  `).join('')}

  <hr/>
`;

const build = async () => {
  const { default: api } = await import('./api')

  const html = htmlTemplate
    .replace('{{ header }}', createHeader(api))
    .replace('{{ endpoints }}', api.endpoints.map(createEndpoint).join(''))
    .replace('{{ title }}', api.info.title)
  
  await fs.mkdir(outputDir, { recursive: true });
  await fs.cp('./src', './dist', { recursive: true });
  await fs.writeFile(`${outputDir}/index.html`, html);
};

build()
if (process.argv.includes('--watch')) {
  watch(__dirname, { recursive: true }, build);
} else if (process.argv.includes('--serve')) {
  const handler = require('serve-handler');
  const http = require('http');

  const server = http.createServer((request: Request, response: Response) => handler(request, response, { public: outputDir }));
  
  server.listen(3000, () => {
    console.log('Running at http://localhost:3000');
  });

  watch(`${__dirname}/src`, { recursive: true }, build);
  watch(`${__dirname}/api.ts`, { recursive: true }, build);
}