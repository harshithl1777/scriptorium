const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const seed = async () => {
    const adminEmail = 'admin1@scriptorium.com';
    const adminPassword = 'admin123@';

    // Create Admin User
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    let adminUserId;
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                isAdmin: true,
            },
        });
        adminUserId = admin.id;
        console.log(`Admin user created with email: ${adminEmail}`);
    } else {
        adminUserId = existingAdmin.id;
        console.log('Admin user already exists.');
    }

    // Generate Users
    const userNames = [
        'John Doe',
        'Jane Smith',
        'Alice Johnson',
        'Bob Brown',
        'Charlie Davis',
        'Diana Miller',
        'Ethan Wilson',
        'Fiona Moore',
        'George Taylor',
        'Hannah Anderson',
        'Ivy Thompson',
        'Jack Carter',
        'Katie Harris',
        'Leo Martinez',
        'Mona Patel',
        'Nate Walker',
        'Olivia Hall',
        'Paul King',
        'Quinn Rogers',
        'Rita Scott',
    ];
    const users = await prisma.user.createMany({
        data: userNames.map((name, index) => {
            const [firstName, lastName] = name.split(' ');
            return {
                firstName,
                lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                password: bcrypt.hashSync('password123', 10),
                isAdmin: false,
            };
        }),
    });
    console.log(`${userNames.length} users created.`);

    const tagNames = [
        'programming',
        'tutorial',
        'beginner-friendly',
        'javascript',
        'python',
        'java',
        'rust',
        'c++',
        'arrays',
        'loops',
        'frontend',
        'backend',
        'data-structures',
        'algorithms',
        'debugging',
        'clean-code',
        'sql',
        'nosql',
        'testing',
        'cloud',
        'career',
        'education',
        'design-patterns',
    ];
    await prisma.tag.createMany({ data: tagNames.map((name) => ({ name })) });
    console.log(`${tagNames.length} tags created.`);

    // Helper to pick random tags
    const pickRandomTags = () => {
        const shuffled = tagNames.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
    };

    const codeExamples = {
        Python: [
            `# For Loop Example\nfor i in range(5):\n    print(i)`,
            `# While Loop Example\ni = 0\nwhile i < 5:\n    print(i)\n    i += 1`,
            `# Array Example\narr = [1, 2, 3]\nfor num in arr:\n    print(num)`,
        ],
        JavaScript: [
            `// For Loop Example\nfor (let i = 0; i < 5; i++) {\n    console.log(i);\n}`,
            `// While Loop Example\nlet i = 0;\nwhile (i < 5) {\n    console.log(i);\n    i++;\n}`,
            `// Array Example\nconst arr = [1, 2, 3];\narr.forEach(num => console.log(num));`,
        ],
        Rust: [
            `// For Loop Example\nfn main() {\n    for i in 0..5 {\n        println!("{}", i);\n    }\n}`,
            `// While Loop Example\nfn main() {\n    let mut i = 0;\n    while i < 5 {\n        println!("{}", i);\n        i += 1;\n    }\n}`,
            `// Array Example\nfn main() {\n    let arr = [1, 2, 3];\n    for num in arr.iter() {\n        println!("{}", num);\n    }\n}`,
        ],
        C: [
            `// For Loop Example\n#include <stdio.h>\nint main() {\n    for (int i = 0; i < 5; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}`,
            `// While Loop Example\n#include <stdio.h>\nint main() {\n    int i = 0;\n    while (i < 5) {\n        printf("%d\\n", i);\n        i++;\n    }\n    return 0;\n}`,
            `// Array Example\n#include <stdio.h>\nint main() {\n    int arr[] = {1, 2, 3};\n    for (int i = 0; i < 3; i++) {\n        printf("%d\\n", arr[i]);\n    }\n    return 0;\n}`,
        ],
        Java: [
            `// For Loop Example\npublic class Main {\n    public static void main(String[] args) {\n        for (int i = 0; i < 5; i++) {\n            System.out.println(i);\n        }\n    }\n}`,
            `// While Loop Example\npublic class Main {\n    public static void main(String[] args) {\n        int i = 0;\n        while (i < 5) {\n            System.out.println(i);\n            i++;\n        }\n    }\n}`,
            `// Array Example\npublic class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3};\n        for (int num : arr) {\n            System.out.println(num);\n        }\n    }\n}`,
        ],
        PHP: [
            `// For Loop Example\n<?php\nfor ($i = 0; $i < 5; $i++) {\n    echo $i . "\\n";\n}\n?>`,
            `// While Loop Example\n<?php\n$i = 0;\nwhile ($i < 5) {\n    echo $i . "\\n";\n    $i++;\n}\n?>`,
            `// Array Example\n<?php\n$arr = [1, 2, 3];\nforeach ($arr as $num) {\n    echo $num . "\\n";\n}\n?>`,
        ],
        Swift: [
            `// For Loop Example\nfor i in 0..<5 {\n    print(i)\n}`,
            `// While Loop Example\nvar i = 0\nwhile i < 5 {\n    print(i)\n    i += 1\n}`,
            `// Array Example\nlet arr = [1, 2, 3]\nfor num in arr {\n    print(num)\n}`,
        ],
        Ruby: [
            `# For Loop Example\n5.times { |i| puts i }`,
            `# While Loop Example\ni = 0\nwhile i < 5\n    puts i\n    i += 1\nend`,
            `# Array Example\narr = [1, 2, 3]\narr.each { |num| puts num }`,
        ],
        Go: [
            `// For Loop Example\npackage main\nimport "fmt"\nfunc main() {\n    for i := 0; i < 5; i++ {\n        fmt.Println(i)\n    }\n}`,
            `// While Loop Example\npackage main\nimport "fmt"\nfunc main() {\n    i := 0\n    for i < 5 {\n        fmt.Println(i)\n        i++\n    }\n}`,
            `// Array Example\npackage main\nimport "fmt"\nfunc main() {\n    arr := []int{1, 2, 3}\n    for _, num := range arr {\n        fmt.Println(num)\n    }\n}`,
        ],
        'C++': [
            `// For Loop Example\n#include <iostream>\nusing namespace std;\nint main() {\n    for (int i = 0; i < 5; i++) {\n        cout << i << endl;\n    }\n    return 0;\n}`,
            `// While Loop Example\n#include <iostream>\nusing namespace std;\nint main() {\n    int i = 0;\n    while (i < 5) {\n        cout << i << endl;\n        i++;\n    }\n    return 0;\n}`,
            `// Array Example\n#include <iostream>\nusing namespace std;\nint main() {\n    int arr[] = {1, 2, 3};\n    for (int num : arr) {\n        cout << num << endl;\n    }\n    return 0;\n}`,
        ],
    };

    const languages = Object.keys(codeExamples);

    for (let langIndex = 0; langIndex < languages.length; langIndex++) {
        const lang = languages[langIndex];
        for (let exampleIndex = 0; exampleIndex < codeExamples[lang].length; exampleIndex++) {
            const code = codeExamples[lang][exampleIndex];
            const titleSuffix = ['For Loops', 'While Loops', 'Arrays'][exampleIndex];

            // Create or connect tags first
            const tagOperations = pickRandomTags().map((tag) => ({
                where: { name: tag },
                create: { name: tag },
            }));

            // Create the code template
            await prisma.codeTemplate.create({
                data: {
                    title: `${lang} ${titleSuffix} Example`,
                    description: `A ${titleSuffix.toLowerCase()} example in ${lang}.`,
                    code,
                    language: lang,
                    authorId: (langIndex % userNames.length) + 1,
                    originalId: exampleIndex === 2 ? langIndex + 1 : null, // Fork array example from first
                    tags: {
                        connectOrCreate: tagOperations,
                    },
                },
            });
        }
    }

    console.log('Code templates created.');

    // Blog posts and associated comments
    const blogPosts = [
        {
            title: 'Understanding For Loops in Programming',
            description:
                'A detailed guide to understanding and using for loops in programming across different languages.',
            content: `For loops are one of the most fundamental control structures in programming. They allow you to repeat a block of code a specific number of times. In this post, we’ll explore how for loops work in several languages, and provide examples to help you master this concept.

## Basic Structure of a For Loop

A for loop typically follows the pattern:

\`\`\`
for (initialization; condition; increment) {
    // code to be executed
}
\`\`\`

This structure is simple, but incredibly powerful. By mastering for loops, you can solve a variety of problems, from processing arrays to handling repetitive tasks.

## Example in Python

Let's see an example in Python:

\`\`\`python
for i in range(5):
    print(i)
\`\`\`

For loops are versatile and form the backbone of many algorithms.`,
            authorId: 1,
            comments: [
                {
                    content: 'Great post! I always struggled with for loops. This really cleared things up.',
                    authorId: 2,
                    parentId: null,
                },
                {
                    content: 'Is the range function in Python similar to a for loop in other languages?',
                    authorId: 3,
                    parentId: null,
                },
                {
                    content: "Yes, it's a common pattern. The range function just generates a sequence of numbers.",
                    authorId: 4,
                    parentId: 2,
                },
            ],
        },
        {
            title: 'How to Use Arrays in JavaScript',
            description:
                'Learn how to work with arrays in JavaScript, one of the most essential data structures in programming.',
            content: `Arrays are one of the most essential data structures in programming. They allow you to store a collection of items in a single variable. In JavaScript, arrays are dynamic and can hold elements of any type, including other arrays or objects.

  ## Example: Basic Array in JavaScript

  Here's an example of how you can use arrays in JavaScript:

  \`\`\`javascript
  let numbers = [1, 2, 3, 4];
  numbers.forEach(num => console.log(num));
  \`\`\`

  Arrays can be used to solve a wide variety of problems, including storing lists of items, processing data, and handling dynamic content in your applications. Understanding how to use arrays efficiently is essential to writing clean, effective code.`,
            authorId: 2,
            comments: [
                {
                    content: 'I love how simple arrays are in JavaScript. Can they be nested?',
                    authorId: 5,
                    parentId: null,
                },
                {
                    content: 'Yes, you can nest arrays in JavaScript. For example: let nestedArray = [[1, 2], [3, 4]];',
                    authorId: 6,
                    parentId: 3,
                },
            ],
        },
        {
            title: 'Exploring While Loops in Python',
            description: 'A beginner’s guide to understanding and implementing while loops in Python.',
            content: `While loops are another important control structure that lets you repeat code as long as a given condition is true. This can be incredibly useful when you don't know beforehand how many times you need to repeat a task.

## Example: While Loop in Python

Here's a simple while loop example in Python:

\`\`\`python
i = 0
while i < 5:
    print(i)
    i += 1
\`\`\`

The condition \`i < 5\` ensures the loop will continue running until \`i\` reaches 5. It's important to always ensure that your loop will eventually terminate to prevent infinite loops.`,
            authorId: 3,
            comments: [
                {
                    content: 'What happens if I forget to increment the variable in a while loop?',
                    authorId: 7,
                    parentId: null,
                },
                {
                    content: "You'll end up with an infinite loop, which can cause your program to freeze or crash.",
                    authorId: 8,
                    parentId: 5,
                },
            ],
        },
        {
            title: 'Basic String Manipulation in JavaScript',
            description:
                'Learn the basics of string manipulation in JavaScript, including common string methods and techniques.',
            content: `# Basic String Manipulation in JavaScript

String manipulation is a fundamental skill in programming, and JavaScript provides a wide array of methods for handling strings. From simple operations like concatenation to more complex tasks like pattern matching, string manipulation is essential for any developer.

## Example: String Concatenation in JavaScript

Here's an example of concatenating strings in JavaScript:

\`\`\`javascript
let str1 = "Hello, ";
let str2 = "World!";
let result = str1 + str2;
console.log(result); // Output: "Hello, World!"
\`\`\`

There are also many other useful string methods, such as \`.slice()\`, \`.replace()\`, and \`.split()\`, which can help you manipulate text in various ways.`,
            authorId: 4,
            comments: [
                {
                    content: 'Can you give an example of using .split() in JavaScript?',
                    authorId: 9,
                    parentId: null,
                },
                {
                    content: "Sure! Here's an example: let words = 'apple,banana,orange'.split(',');",
                    authorId: 10,
                    parentId: 7,
                },
            ],
        },
        {
            title: 'Exploring the Basics of Recursion in Programming',
            description:
                'A deep dive into the concept of recursion, a technique often used in algorithms and problem-solving.',
            content: `Recursion is a method of solving problems where a function calls itself. It’s a powerful technique used in many different areas of programming, including sorting, searching, and even in graphical algorithms.

### Example: Calculating Factorial Using Recursion in Python

Here's a basic example of recursion in Python, calculating the factorial of a number:

\`\`\`python
def factorial(n):
  if n == 0:
    return 1
  return n * factorial(n-1)

print(factorial(5))
# Output: 120
\`\`\`

Recursion is an important concept, but it’s important to ensure that your recursive function has a base case to prevent infinite recursion.`,
            authorId: 5,
            comments: [
                {
                    content: 'I’m still not sure when recursion is appropriate. Can you clarify?',
                    authorId: 11,
                    parentId: null,
                },
                {
                    content:
                        'Recursion is most useful when the problem can be broken down into smaller subproblems that resemble the original problem.',
                    authorId: 12,
                    parentId: 9,
                },
            ],
        },
    ];

    // Create blog posts with comments
    for (const post of blogPosts) {
        const blogPost = await prisma.blogPost.create({
            data: {
                title: post.title,
                description: post.description,
                content: post.content,
                authorId: post.authorId,
                tags: {
                    connectOrCreate: pickRandomTags().map((tagName) => ({
                        where: { name: tagName },
                        create: { name: tagName },
                    })),
                },
                comments: {
                    create: post.comments.map((comment) => ({
                        content: comment.content,
                        authorId: comment.authorId,
                        parentId: comment.parentId,
                    })),
                },
            },
        });
    }

    console.log('Blog posts seeded.');

    const reportReasons = [
        'Spam',
        'Inappropriate Content',
        'Offensive Language',
        'Misinformation',
        'Plagiarism',
        'Hate Speech',
        'Harassment',
        'Threatening Behavior',
        'Violent Content',
        'Discrimination',
    ];

    const blogPostIds = [3, 3, 3, 5, 5, 1];
    const commentIds = [2, 2, 3, 3];

    const blogPostReports = await prisma.report.createMany({
        data: blogPostIds.map((blogPostId, index) => {
            return {
                reason: reportReasons[index % reportReasons.length], // Alternate report reasons
                reporterId: ((index + 1) % 20) + 1, // Random user reporting (users 1 to 20)
                blogPostId,
            };
        }),
    });

    const commentReports = await prisma.report.createMany({
        data: commentIds.map((commentId, index) => {
            return {
                reason: reportReasons[index % reportReasons.length],
                reporterId: ((index + 1) % 20) + 1,
                commentId,
            };
        }),
    });

    console.log('Blog Post Reports Created:', blogPostReports);
    console.log('Comment Reports Created:', commentReports);

    // Now, let's add upvotes and downvotes for the same blog posts with random totals
    const blogPostUpdates = []; // To track the number of upvotes and downvotes for each post

    const userVotes = await prisma.userVote.createMany({
        data: [1, 2, 3, 4, 5].flatMap((blogPostId) => {
            const userVotesForPost = [];
            const totalVotes = Math.floor(Math.random() * 16) + 5; // Random between 5 and 20 votes per blog post
            let upvoteCount = 0;
            let downvoteCount = 0;

            // Randomly assign upvotes and downvotes
            for (let i = 0; i < totalVotes; i++) {
                // Randomly decide whether the vote is upvote or downvote
                const voteType = Math.random() < 0.5 ? 'upvote' : 'downvote';

                // Ensure users vote only once per blog post
                userVotesForPost.push({
                    userId: (i % 20) + 1, // Pick users 1 to 20 (rotate as necessary)
                    targetId: blogPostId,
                    targetType: 'post',
                    voteType,
                });

                // Track the upvote and downvote counts
                if (voteType === 'upvote') {
                    upvoteCount++;
                } else {
                    downvoteCount++;
                }
            }

            // After voting, we update the blog post's vote counts
            blogPostUpdates.push({
                blogPostId,
                upvotes: upvoteCount,
                downvotes: downvoteCount,
            });

            return userVotesForPost;
        }),
    });

    // After creating votes, we update blog post records to reflect the counts
    for (const update of blogPostUpdates) {
        await prisma.blogPost.update({
            where: { id: update.blogPostId },
            data: {
                upvotes: update.upvotes,
                downvotes: update.downvotes,
            },
        });
    }

    console.log('User Votes Created:', userVotes);
};

seed()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
