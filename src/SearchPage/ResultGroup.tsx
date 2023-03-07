import { MetadataResponse } from '../MetadataResponse';
import * as API from '../hydrus-backend'

export type ResultGroup = {
    cover: string; // This is a hash for cover image of the group
    title: string; // title of the group - should allow for for easy searching for the rest of the group with adding * after it
    subgroups: Map<string, ResultGroup>; // Subgroups if any
    entries: Array<MetadataResponse>; // This will be probably empty for groups that also have subgroups as those files should belong to the subgroups entries
    type: string; // What type the group is, used for proper formatting and tag display ex. image,comic,photoset etc.
  }