# Contributing to TextFlow

Thank you for your interest in contributing to TextFlow! We welcome contributions from the community.

## Ways to Contribute

### 1. 📚 Add Words to Global Dictionaries

The easiest way to contribute! Help expand our phrase collections:

1. Visit the API at `http://localhost:3000/api/dictionaries/list`
2. Find a global dictionary or one with `allowCommunityEdit: true`
3. Add your phrases using the API or Google Docs add-on

**Example:**
```bash
curl -X POST http://localhost:3000/api/dictionaries/DICT_ID/words \
  -H "Content-Type: application/json" \
  -d '{"from": "in order to", "to": "to"}'
```

### 2. 🐛 Report Bugs

Found a bug? Help us fix it:

1. Check if the issue already exists
2. Open a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Node version)

### 3. 💡 Suggest Features

Have an idea? We'd love to hear it:

1. Open an issue with the `feature request` label
2. Describe the feature and use case
3. Explain why it would be valuable

### 4. 🔧 Submit Pull Requests

Want to contribute code? Here's how:

#### Setup Development Environment

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/TextFlow.git
cd TextFlow

# Add upstream remote
git remote add upstream https://github.com/xoxxel/TextFlow.git

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection

# Start development server
npm run dev
```

#### Making Changes

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   **Commit Message Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request:**
   - Go to GitHub and create a PR
   - Describe your changes
   - Reference any related issues

#### Code Style Guidelines

```javascript
// ✅ Good
async function createDictionary(data) {
  try {
    const errors = validateDictionary(data);
    if (errors) {
      return { error: errors, status: 400 };
    }
    
    const dictionary = {
      id: uuidv4(),
      name: data.name.trim(),
      // ... more fields
    };
    
    await collection.insertOne(dictionary);
    return { success: true, dictionary };
  } catch (error) {
    throw new Error(`Failed to create dictionary: ${error.message}`);
  }
}

// ❌ Bad
async function createDictionary(data) {
  const errors = validateDictionary(data);
  if (errors) return { error: errors, status: 400 };
  const dictionary = { id: uuidv4(), name: data.name.trim() };
  await collection.insertOne(dictionary);
  return { success: true, dictionary };
}
```

**Standards:**
- Use async/await (not callbacks)
- Use ES6+ features (arrow functions, destructuring, etc.)
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions small and focused
- Handle errors properly

### 5. 📖 Improve Documentation

Help make our docs better:

- Fix typos or unclear explanations
- Add examples
- Improve API documentation
- Translate to other languages

### 6. 🌍 Add Language Support

Want to add a new language?

1. Create `dictionary/LANG_CODE.json`:
   ```json
   [
     {
       "from": "formal phrase",
       "to": "casual alternative"
     }
   ]
   ```

2. Update `SUPPORTED_LANGS` in [server.js](server.js)
3. Test thoroughly
4. Submit PR with examples

### 7. 🎨 Create Dictionaries

Share useful phrase collections:

1. Create a dictionary via API
2. Add high-quality phrases
3. Set `isPublic: true` and `allowCommunityEdit: true`
4. Share the dictionary ID in discussions

## Development Workflow

### Running Tests

```bash
# Start server
npm start

# In another terminal, run tests
node test-custom-dictionaries.js
```

### Testing Changes

Before submitting:

1. Test all affected endpoints
2. Check both success and error cases
3. Verify authentication works correctly
4. Test with different languages
5. Check MongoDB operations

### Common Development Tasks

**Add a new endpoint:**
```javascript
// 1. Add route in custom-dictionaries/routes.js
router.get('/new-endpoint', async (req, res) => {
  // implementation
});

// 2. Add controller function in custom-dictionaries/controller.js
async function newFunction() {
  // logic
}

// 3. Export and use
module.exports = { newFunction };
```

**Update schema:**
```javascript
// 1. Update in custom-dictionaries/schema.js
const dictionary = {
  // ... existing fields
  newField: 'default value'
};

// 2. Create migration script if needed
// 3. Update documentation
```

## Review Process

1. **Automated checks:** Code style, tests
2. **Manual review:** Code quality, functionality
3. **Feedback:** Address review comments
4. **Approval:** Maintainer approves
5. **Merge:** Changes merged to main

## Questions?

- 💬 Open a discussion on GitHub
- 📧 Email: support@serpify.dev
- 🐛 Create an issue for bugs

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in commits

Thank you for contributing to TextFlow! 🎉
