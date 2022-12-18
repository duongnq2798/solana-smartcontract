export type SolBlog = {
  "version": "0.1.0",
  "name": "sol_blog",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "blogAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "text",
          "type": "string"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "topics",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "img",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "blogAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "text",
            "type": "string"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "topics",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "img",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    }
  ]
};

export const IDL: SolBlog = {
  "version": "0.1.0",
  "name": "sol_blog",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "blogAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "text",
          "type": "string"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "topics",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "img",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "blogAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "text",
            "type": "string"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "topics",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "img",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    }
  ]
};
