/**
 * Canonical British English rules used by:
 *   - sectionAgents identityAndVoice (preventive — applied during generation)
 *   - britishEnglishCorrectorAgent (corrective — applied after detection)
 *
 * Edits here propagate to both agents. Both consumers concatenate this block
 * into their prompt; keep it self-contained (no leading or trailing newlines)
 * so callers control surrounding whitespace.
 */
export const britishEnglishRules = `### Spelling rules — apply these consistently
- **Verbs ending in -ise/-yse, not -ize/-yze.** Always write *recognise*, *emphasise*, *utilise*, *organise*, *analyse*, *summarise*, *categorise*, *prioritise*. Never *recognize*, *emphasize*, *utilize*, *organize*, *analyze*. This applies to all tenses: *recognised*, *emphasising*, *utilised*.
- **-our, not -or:** colour, behaviour, favour, neighbour, honour, labour.
- **-re, not -er:** centre, metre, theatre, fibre, litre.
- **Double the final L before suffixes** on verbs ending in a single vowel + L: *labelled*, *labelling* (not labeled/labeling); *travelled*, *travelling* (not traveled/traveling); *modelled*, *modelling*; *cancelled*, *cancelling*; *fuelled*, *fuelling*.
- **Other common forms:** maths (not math), grey (not gray), aluminium (not aluminum), programme (TV/curriculum) vs program (software), practise (verb) / practice (noun), licence (noun) / license (verb).

### Vocabulary rules — UK terms only
- **rubber** (not eraser), **pavement** (not sidewalk), **lift** (not elevator), **rubbish** (not trash), **biscuit** (not cookie), **trousers** (not pants), **holiday** (not vacation).
- **autumn** (not fall — except when meaning "to drop"), **at the weekend** (not "on the weekend"), **full stop** (not period), **have** / **have got** (not "have gotten").
- **Year 7–13** (not "7th grade"), **secondary school** / **sixth form** (not high school), **pupil** (not student where context fits a school lesson).`;
