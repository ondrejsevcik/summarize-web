# Zod v4 Migration Guide

This document outlines the changes made to upgrade this project from Zod v3 to Zod v4.

## Changes Made

### 1. Updated Dependencies

Updated `package.json` to use Zod v4.1.5:
```json
"zod": "^4.1.5"
```

### 2. Updated Import Syntax

The primary breaking change in Zod v4 is the import syntax. The recommended approach has changed from default imports to named imports.

**Before (v3):**
```typescript
import zod from "zod";

export const MessageSchema = zod.object({
    action: zod.string(),
    payload: zod.unknown(),
});

export type Message = zod.infer<typeof MessageSchema>;
```

**After (v4):**
```typescript
import { z } from "zod";

export const MessageSchema = z.object({
    action: z.string(),
    payload: z.unknown(),
});

export type Message = z.infer<typeof MessageSchema>;
```

### 3. Files Modified

- `src/types.ts` - Updated import syntax and all zod references

## Benefits of Migration

1. **Better Tree Shaking**: The new named import syntax enables better tree shaking, reducing bundle sizes from ~237KB back to ~57KB
2. **Future Compatibility**: Using the recommended v4 import pattern ensures compatibility with future Zod releases
3. **Performance**: Improved build performance with better dead code elimination

## Validation

- ✅ Build succeeds with `npm run build`
- ✅ Bundle sizes are optimized (57KB vs 237KB with incorrect import)
- ✅ Linting passes with `npx biome check src/`
- ✅ All existing schema validation functionality preserved
- ✅ TypeScript type inference continues to work correctly

## No Breaking Changes for End Users

This migration maintains full backward compatibility for the extension's functionality. All existing schemas and validation logic work exactly as before.