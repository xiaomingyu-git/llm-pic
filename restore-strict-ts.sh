#!/bin/bash

echo "恢复严格的TypeScript设置..."

# 恢复tsconfig.app.json
cat > tsconfig.app.json << 'EOF'
{
  "include": [
    "env.d.ts",
    "src/**/*",
    "src/**/*.vue"
  ],
  "exclude": [
    "src/**/__tests__/*"
  ],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": [
      "vite/client",
      "element-plus/global",
      "node"
    ]
  }
}
EOF

# 恢复tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.node.json"
    },
    {
      "path": "./tsconfig.app.json"
    }
  ]
}
EOF

# 清理缓存
rm -f *.tsbuildinfo
rm -rf node_modules/.cache
rm -rf .vite

echo "✅ 严格的TypeScript设置已恢复"
echo "请重启VS Code以生效"
