import dedent from "dedent";
import type { IAPI } from "./build";

export const types = {
  SiteInfo: dedent`{
    "id": number,
    "username": string,
    "title": string,
    "updates": number,
    "followers": number,
    "views": number,
    "created_at": number,
    "updated_at": number
  }`,
  BigFileCreate: dedent`{
    "id": string
  }`,
  Folder: dedent`[
    {
      "name": string,
      "dir": boolean
    }
  ]`,
  Limits: dedent`{
    "general": { "limit": number, "remaining": number, "reset": number },
    "big_uploads": { "limit": number, "remaining": number, "reset": number },
    "zip": { "limit": number, "remaining": number, "reset": number }
  }`
}

const api: IAPI = {
  info: {
    title: 'Nekoweb API',
    description: 'API for Nekoweb'
  },
  endpoints: [
    {
      path: '/site/info',
      methods: ['GET'],

      description: 'Get information about your site.',
      extras: [
        { type: 'info', data: 'This endpoint requires the the `token` cookie to be set to a valid Nekoweb token.'}
      ],
      tags: [],

      output: {
        200: 'SiteInfo'
      }
    },
    {
      path: '/site/info/:username',
      methods: ['GET'],

      description: 'Get information about a user\'s site.',
      extras: [
        { type: 'info', data: 'This endpoint doesn\'t require auth if requested from a Nekoweb site.' }
      ],
      tags: [],

      output: {
        200: 'SiteInfo'
      }
    },
    {
      path: '/files/create',
      methods: ['POST'],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      parameters: {
        pathname: { type: 'string', required: true, description: 'The path to the file or folder.' },
        isFolder: { type: 'boolean', required: true, description: 'Whether the file is a folder or not.' }
      },

      description: 'Create a new file or folder.',
      tags: ['general']
    },
    {
      path: '/files/upload',
      methods: ['POST'],
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      parameters: {
        pathname: { type: 'string', required: true, description: 'The path of the folder to upload to.' }
      },

      description: 'Upload a file or files.',
      extras: [
        { type: 'info', data: 'This will overwrite old files. Max 100MB.' }
      ],

      tags: ['general']
    },
    {
      path: '/files/delete',
      methods: ['POST'],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      parameters: {
        pathname: { type: 'string', required: true, description: 'The path to the file or folder to delete.' }
      },

      description: 'Delete a file or folder.',
      tags: ['general']
    },
    {
      path: '/files/rename',
      methods: ['POST'],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      parameters: {
        pathname: { type: 'string', required: true, description: 'The old path of the file or folder.' },
        newpathname: { type: 'string', required: true, description: 'The new path of the file or folder.' }
      },

      description: 'Rename/move a file or folder.',
      tags: ['general']
    },
    {
      path: '/files/edit',
      methods: ['POST'],
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      parameters: {
        pathname: { type: 'string', required: true, description: 'The path to the file to edit.' },
        content: { type: 'string', required: true, description: 'The new content of the file.' }
      },

      description: 'Edit a file.',

      tags: ['general']
    },
    {
      path: '/files/readfolder',
      methods: ['GET'],
      parameters: {
        pathname: { type: 'string', required: true, description: 'The path to the folder to read.' }
      },

      description: 'Read a folder.',
      tags: ['general'],

      examples: [
        {
          language: 'JavaScript',
          code: `const res = await fetch('https://nekoweb.org/api/files/readfolder?pathname=/')\nconsole.log(await res.json())`
        }
      ],

      output: {
        200: 'Folder'
      }
    },
    {
      path: '/files/big/create',
      methods: ['GET'],

      description: 'Create upload for a big file. Allows you to upload files larger than 100MB.',
      tags: ['big_uploads'],

      examples: [
        {
          language: 'JavaScript',
          code: `const res = await fetch('https://nekoweb.org/api/files/big/create')\nconsole.log(await res.json())`
        }
      ],

      output: {
        200: 'BigFileCreate'
      }
    },
    {
      path: '/files/big/append',
      methods: ['POST'],
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      parameters: {
        id: { type: 'string', required: true, description: 'The ID of the big file upload.' },
        file: { type: 'file', required: true, description: 'Chunk of file.' }
      },

      description: 'Append a chunk to a big file upload.',
      extras: [
        { type: 'info', data: 'Chunk must be less than 100MB.' }
      ],
      tags: ['big_uploads']
    },
    {
      path: '/files/big/move',
      methods: ['POST'],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      parameters: {
        id: { type: 'string', required: true, description: 'The ID of the big file upload.' },
        pathname: { type: 'string', required: true, description: 'The path to the file to move to.' }
      },

      description: 'Move a big file upload to the final location.',
      tags: ['big_uploads']
    },
    {
      path: '/files/import/:bigid',
      methods: ['POST'],

      description: 'Import a big file upload to the final location.',
      tags: ['big_uploads', 'zip']
    },
    {
      path: '/files/limits',
      methods: ['GET'],

      description: 'Returns a JSON object with info about status of various rate limits for your account.',
      extras: [
        { type: 'info', data: 'If reset is -1, it means reset counter hasn\'t started yet, and will only appear after you make the first request.\n`general` refers to most of file operations, `big_uploads` refers to creation of big file uploads, and `zip` refers to importing and exporting of zip files.'}
      ],
      tags: [],

      output: {
        200: 'Limits'
      },
    }
  ]
}

export default api