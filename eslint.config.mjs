import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [{
  ignores: ["**/dist", "**/node_modules"],
}, ...compat.extends("plugin:@typescript-eslint/recommended"), {
  plugins: {
    "@typescript-eslint": typescriptEslint,
  },

  languageOptions: {
    parser: tsParser,
  },

  rules: {
    "@typescript-eslint/no-unused-expressions": "off",
    "no-console": 0,
    "no-unused-vars": "off",

    "max-len": ["error", {
      code: 180,
    }],

    "max-depth": ["error", 4],
    "max-params": ["error", 4],
    "max-lines": ["error", 5000],

    "no-multiple-empty-lines": ["error", {
      max: 1,
      maxEOF: 1,
    }],

    "no-trailing-spaces": ["error", {
      skipBlankLines: true,
    }],

    indent: ["warn", 2, {
      SwitchCase: 1,
      ignoredNodes: [
        "TemplateLiteral",
        "JSXElement",
        "JSXElement > *",
        "JSXAttribute",
        "JSXIdentifier",
        "JSXNamespacedName",
        "JSXMemberExpression",
        "JSXSpreadAttribute",
        "JSXExpressionContainer",
        "JSXOpeningElement",
        "JSXClosingElement",
        "JSXFragment",
        "JSXOpeningFragment",
        "JSXClosingFragment",
        "JSXText",
        "JSXEmptyExpression",
        "JSXSpreadChild"
      ],
      offsetTernaryExpressions: true,
    }],

    "sort-imports": ["error", {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
    }],

    "no-var": "error",
    "no-undefined": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
}, {
  // Allow examples to import from src
  files: ["examples/**/*.ts"],
  rules: {
    "no-restricted-imports": "off",
  },
}, {
  // Allow integration tests to import from examples
  files: ["tests/**/*.integration.test.ts"],
}];
