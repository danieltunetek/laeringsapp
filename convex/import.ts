/**
 * This mutation seeds the database with quiz questions from a JSON file.
 * It is designed to be robust and handle a heterogeneous array, meaning the
 * JSON file can contain a mix of two different object types:
 *
 * 1. Standalone Question Objects: These are top-level objects that represent
 * a single question and have their own `questionId`.
 *
 * 2. Passage Objects: These are top-level objects that contain shared metadata
 * (like subject and topic) and a nested array of `questions` related to a
 * specific passage of text.
 *
 * To run this mutation:
 * 1. Ensure your `questions_data.json` file is in the parent directory (`../`).
 * 2. Run the mutation from the Convex dashboard or via the Convex CLI using:
 * npx convex run seed_questions
 */
import questionsData from "../questions_data.json";
import { internalMutation } from "./_generated/server";

// This is an 'internalMutation' - it can only be run from the Convex dashboard
// or CLI, not directly by app users, ensuring data integrity.
export const seedQuestions = internalMutation({
  handler: async (ctx) => {
    // 1. Clear any existing questions to prevent duplicates when re-seeding.
    console.log("Deleting existing questions from the database...");
    const existing = await ctx.db.query("questions").collect();
    await Promise.all(existing.map((doc) => ctx.db.delete(doc._id)));
    console.log(`-> ${existing.length} questions deleted.`);

    let importedCount = 0;
    console.log(`Processing ${questionsData.length} top-level items from the JSON file...`);

    // 2. Loop through each item in the main array from the JSON file.
    for (const item of questionsData) {
      
      // 3. Check the structure of the item to determine how to process it.

      // --- Case A: The item is a STANDALONE question. ---
      // We identify this by the presence of a `questionId` and the absence of a nested `questions` array.
      if (item.questionId && !item.questions) {
        await ctx.db.insert("questions", {
          questionId: item.questionId,
          subject: item.subject,
          courseCodes: item.courseCodes ?? [],
          gradeLevel: item.gradeLevel,
          line: item.line,
          category: item.category,
          topic: item.topic,
          difficulty: item.difficulty,
          suitableForOralPractice: item.suitableForOralPractice ?? false,
          questionText: item.questionText,
          options: item.options,
          explanation: item.explanation,
        });
        importedCount++;
        continue; // Proceed to the next top-level item.
      }

      // --- Case B: The item is a PASSAGE containing multiple questions. ---
      // We identify this by the presence of `passageId` and a nested `questions` array.
      if (item.passageId && Array.isArray(item.questions)) {
        // Now, loop through the nested questions within this passage.
        for (const question of item.questions) {
          // It's good practice to validate nested items as well.
          if (!question.questionId) {
            console.warn("Skipping a question inside a passage because it's missing a questionId:", question);
            continue;
          }

          // Insert the question, combining data from the parent passage.
          await ctx.db.insert("questions", {
            // Data specific to the individual question:
            questionId: question.questionId,
            questionText: question.questionText,
            options: question.options,
            explanation: question.explanation,
            // Data inherited from the parent passage object:
            subject: item.subject,
            courseCodes: item.courseCodes ?? [],
            gradeLevel: item.gradeLevel,
            line: item.line,
            category: item.category,
            topic: item.topic,
            difficulty: item.difficulty,
            suitableForOralPractice: item.suitableForOralPractice ?? false,
          });
          importedCount++;
        }
        continue; // Proceed to the next top-level item.
      }

      // --- Fallback Case: The item's structure is not recognized. ---
      // This helps in debugging the JSON file if some items have an unexpected format.
      console.warn("Skipping an item with an unrecognized structure:", item);
    }

    console.log(`✅ Import complete! ${importedCount} questions were successfully imported.`);
  },
});
