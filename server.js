const { OpenAI } = require("@langchain/openai");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Initialize the OpenAI model
const model = new OpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
  model_name: "gpt-3.5-turbo",
});

// Create a prompt function that takes the user input and passes it through the call method
const promptFunc = async (input, targetLanguage) => {
  try {
    // With a `StructuredOutputParser` we can define a schema for the output.
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      // Define the output variables and their descriptions
      targetLanguage: `The user's word or phrase translated in ${targetLanguage.toLowerCase()}`,
    });

    // Get the format instructions from the parser
    const formatInstructions = parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      // Define the template for the prompt
      template:
        "You are a helpful translator that understands all of the current languages in the world. You will translate anything that is asked of you while also understanding that phrases and addages may get lost in translation. In those cases, you will return a translated version of the user's phrase in a close approximation.\n{format_instructions}\n{question}",
      inputVariables: ["question"],
      partialVariables: { format_instructions: formatInstructions },
    });
    // Format the prompt with the user input
    const promptInput = await prompt.format({
      question: input,
    });
    
    // Call the model with the formatted prompt
    const res = await model.invoke(promptInput);
    const parsedResult = await parser.parse(res);
    console.log(parsedResult);
    return parsedResult;
    // Catch any errors and log them to the console
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Endpoint to handle request
app.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    const result = await promptFunc(text, targetLanguage);
    res.json({ result });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
