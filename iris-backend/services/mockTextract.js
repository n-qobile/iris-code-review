// Simulates AWS Textract document analysis
class MockTextractService {
  async extractText(imageData) {
    // Simulate processing delay
    await this.delay(1200);

    const hasDocument = Math.random() > 0.7;

    if (!hasDocument) {
      console.log(`📄 Mock Textract: No document detected`);
      return {
        extractedText: "",
        blocks: [],
      };
    }

    // Mock extracted text
    const extractedText = `
      Sample Document Title
      Date: ${new Date().toLocaleDateString()}
      
      This is mock extracted text from a document.
      Line 1: Important information here
      Line 2: More details
      
      Total: $123.45
    `.trim();

    console.log(
      `📄 Mock Textract: Extracted ${extractedText.length} characters`,
    );

    return {
      extractedText,
      blocks: [
        { Text: "Sample Document Title", BlockType: "LINE", Confidence: 98.2 },
        { Text: extractedText, BlockType: "PAGE", Confidence: 95.7 },
      ],
    };
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new MockTextractService();
