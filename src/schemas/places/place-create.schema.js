import { z } from 'zod';

const toBoolean = z.union([
  z.boolean(),
  z.string().transform((value, ctx) => {
    const normalized = value.toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Field 'ispublic' must be a boolean"
    });

    return z.NEVER;
  })
]);

const createPlaceSchema = z.object({
  name: z.string().trim().min(1, "Field 'name' is required"),
  countryid: z.coerce.number().int().positive("Field 'countryid' must be a positive integer"),
  stateid: z.coerce.number().int().positive("Field 'stateid' must be a positive integer"),
  cityid: z.coerce.number().int().positive("Field 'cityid' must be a positive integer"),
  description: z.string().trim().min(1, "Field 'description' is required"),
  address: z.string().trim().min(1, "Field 'address' is required"),
  ispublic: toBoolean.optional().default(false),
  latitude: z.coerce.number().min(-90, "Field 'latitude' must be between -90 and 90").max(90, "Field 'latitude' must be between -90 and 90"),
  longitude: z.coerce.number().min(-180, "Field 'longitude' must be between -180 and 180").max(180, "Field 'longitude' must be between -180 and 180")
}).strict();

const getCreatePlaceErrorMessage = (error) => {
  const issue = error?.issues?.[0];

  if (!issue) {
    return 'Invalid create place payload';
  }

  if (issue.code === 'unrecognized_keys') {
    return `Unexpected field(s): ${issue.keys.join(', ')}`;
  }

  return issue.message || 'Invalid create place payload';
};

export {
  createPlaceSchema,
  getCreatePlaceErrorMessage
};
