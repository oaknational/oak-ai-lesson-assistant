function ingest() {
  /**
   * init
   */
  // new ingest record in db
  //
  /**
   * import lessons
   */
  // fetch lessons
  // store raw lessons -> status = fetched
  // transform and store transformed lessons, set lesson status = transformed
  //
  /**
   * select lessons for ingest
   */
  // filter lessons depending on params (e.g. created_at/model/not_exists_already)
  // fetch lessons from AI db
  // compare and select lessons to ingest
  // set ingest_lesson status = selected_and_ready
  //
  /**
   * on ingest_lessons_selected_and_ready -> new batch
   */
  // get selected lesson data
  // write batch of requests to jsonl file
  // send batch to OpenAI batch api
  // store batch id and status in ingest_lesson_plan_batches table
  /**
   * on ingest_lesson_plan_batches status change
   */
  // for all batches in db where status = pending
  // check batch status
  // if status = pending, do nothing
  // if status = failed, store error message, set status = failed + add error to ingest_errors
  // if status = completed, store results, set status = received
  // check each result for errors
  // for each error store it in ingest_errors, update ingest_lesson status
  // for each good result, store it in the ingest_lesson_plans table, with status = ready_for_parts
  /**
   * on plans_ready_for_parts
   */
  // for all ingest_lesson_plans where status = ready_for_parts
  // transform and store ingest_lesson_plan_parts, with status = ready_to_embed
  /**
   * on parts_ready_to_embed -> new batch
   */
  // for all ingest_lesson_plan_parts where status = ready_to_embed
  // write batch of requests to jsonl file
  // send batch to OpenAI batch api
  // store batch id and status in ingest_lesson_plan_parts_embeddings_batches table
  /**
   * on ingest_lesson_plan_parts_embeddings_batches status change
   * check batch status
   * if status = pending, do nothing
   * if status = failed, store error message, set status = failed + add error to ingest_errors
   * if status = completed, store results, set status = received
   * check each result for errors
   * for each error store it in ingest_errors, update ingest_lesson_plan_parts status
   * for each good result, store it in the ingest_lesson_plan_parts table
   */
}
