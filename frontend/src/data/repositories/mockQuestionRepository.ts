import { Question } from "domain/entities/Question";
import { IQuestionInput, IQuestionUpdateInput } from "../../domain/repositories/IQuestionRepository";
import { mockCategoryRemoteDataSource } from "./mockCategoryRepository";

const { categories } = mockCategoryRemoteDataSource;

const initialQuestions: Question[] = [
    {
        _id: "i1",
        code: "1",
        title: "Reverse a String",
        description: `
### Problem

Write a function that reverses a string. The input string is given as an array of characters \`s\`. You must do this by modifying the input array **in-place** with O(1) extra memory.

### Instructions

- Reverse the characters in the array in-place.
- Do not allocate extra space for another array.

### Example

**Input:**
\`\`\`text
s = ["h", "e", "l", "l", "o"]
\`\`\`

**Output:**
\`\`\`text
["o", "l", "l", "e", "h"]
\`\`\`

### Constraints

- 1 <= \`s.length\` <= 10^5
- \`s[i]\` is a printable ASCII character.
    `,
        difficulty: "Easy",
        categories: [
            categories.find(cat => cat.name === "Strings")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/reverse-string/"
    },
    {
        _id: "i2",
        code: "2",
        title: "Linked List Cycle Detection",
        description: `
### Problem

Implement a function to detect if a linked list contains a cycle.

![Linked List Cycle](https://assets.leetcode.com/uploads/2018/12/07/circularlinkedlist.png)

### Instructions

- Given a linked list, determine if it has a cycle in it.
- Can you solve it using O(1) memory?

### Example

**Input:**
\`\`\`
head = [3, 2, 0, -4], pos = 1 (indicating tail connects to node index 1)
\`\`\`

**Output:**
\`\`\`
true
\`\`\`

### Constraints

- The number of nodes in the list is in the range [0, 10^4].
- \`-10^5 <= Node.val <= 10^5\`.
    `,
        difficulty: "Easy",
        categories: [
            categories.find(cat => cat.name === "Data Structures")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/linked-list-cycle/"
    },
    {
        _id: "i3",
        code: "3",
        title: "Roman to Integer",
        description: "Given a roman numeral, convert it to an integer.",
        difficulty: "Easy",
        categories: [
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/roman-to-integer/"
    },
    {
        _id: "i4",
        code: "4",
        title: "Add Binary",
        description: "Given two binary strings a and b, return their sum as a binary string.",
        difficulty: "Easy",
        categories: [
            categories.find(cat => cat.name === "Bit Manipulation")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/add-binary/"
    },
    {
        _id: "i5",
        code: "5",
        title: "Fibonacci Number",
        description: `
The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).`,
        difficulty: "Easy",
        categories: [
            categories.find(cat => cat.name === "Recursion")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/fibonacci-number/"
    },
    {
        _id: "i6",
        code: "6",
        title: "Implement Stack using Queues",
        description: `
Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).`,
        difficulty: "Easy",
        categories: [
            categories.find(cat => cat.name === "Data Structures")!
        ],
        url: "https://leetcode.com/problems/implement-stack-using-queues/"
    },
    {
        _id: "i7",
        code: "7",
        title: "Combine Two Tables",
        description: `
Write a SQL solution to report the first name, last name, city, and state of each person in the Person table. If the address of a personId is not present in the Address table, report null instead.`,
        difficulty: "Easy",
        categories: [
            categories.find(cat => cat.name === "Databases")!
        ],
        url: "https://leetcode.com/problems/combine-two-tables/"
    },
    {
        _id: "i8",
        code: "8",
        title: "Repeated DNA Sequences",
        description: `
Given a string s that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in a DNA molecule.`,
        difficulty: "Medium",
        categories: [
            categories.find(cat => cat.name === "Algorithms")!,
            categories.find(cat => cat.name === "Bit Manipulation")!
        ],
        url: "https://leetcode.com/problems/repeated-dna-sequences/"
    },
    {
        _id: "i9",
        code: "9",
        title: "Course Schedule",
        description: `
There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.`,
        difficulty: "Medium",
        categories: [
            categories.find(cat => cat.name === "Data Structures")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/course-schedule/"
    },
    {
        _id: "i10",
        code: "10",
        title: "LRU Cache Design",
        description: "Design and implement an LRU (Least Recently Used) cache.",
        difficulty: "Medium",
        categories: [
            categories.find(cat => cat.name === "Data Structures")!
        ],
        url: "https://leetcode.com/problems/lru-cache/"
    },
    {
        _id: "i11",
        code: "11",
        title: "Longest Common Subsequence",
        description: `
Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.`,
        difficulty: "Medium",
        categories: [
            categories.find(cat => cat.name === "Strings")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/longest-common-subsequence/"
    },
    {
        _id: "i12",
        code: "12",
        title: "Rotate Image",
        description: `
You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).`,
        difficulty: "Medium",
        categories: [
            categories.find(cat => cat.name === "Arrays")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/rotate-image/"
    },
    {
        _id: "i13",
        code: "13",
        title: "Airplane Seat Assignment Probability",
        description: `
n passengers board an airplane with exactly n seats. The first passenger has lost the ticket and picks a seat randomly. But after that, the rest of the passengers will take their own seat if it is still available, and pick other seats randomly when they find their seat occupied. Return the probability that the nth person gets his own seat.`,
        difficulty: "Medium",
        categories: [
            categories.find(cat => cat.name === "Brainteaser")!
        ],
        url: "https://leetcode.com/problems/airplane-seat-assignment-probability/"
    },
    {
        _id: "i14",
        code: "14",
        title: "Validate Binary Search Tree",
        description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
        difficulty: "Medium",
        categories: [
            categories.find(cat => cat.name === "Data Structures")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/validate-binary-search-tree/"
    },
    {
        _id: "i15",
        code: "15",
        title: "Sliding Window Maximum",
        description: `
You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window.`,
        difficulty: "Hard",
        categories: [
            categories.find(cat => cat.name === "Arrays")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/sliding-window-maximum/"
    },
    {
        _id: "i16",
        code: "16",
        title: "N-Queen Problem",
        description: `
The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.`,
        difficulty: "Hard",
        categories: [
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/n-queens/"
    },
    {
        _id: "i17",
        code: "17",
        title: "Serialize and Deserialize a Binary Tree",
        description: `
Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.`,
        difficulty: "Hard",
        categories: [
            categories.find(cat => cat.name === "Data Structures")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"
    },
    {
        _id: "i18",
        code: "18",
        title: "Wildcard Matching",
        description: `
Given an input string (s) and a pattern (p), implement wildcard pattern matching with support for '?' and '*' where: '?' Matches any single character. '*' Matches any sequence of characters (including the empty sequence). The matching should cover the entire input string (not partial).`,
        difficulty: "Hard",
        categories: [
            categories.find(cat => cat.name === "Strings")!,
            categories.find(cat => cat.name === "Algorithms")!
        ],
        url: "https://leetcode.com/problems/wildcard-matching/"
    },
    {
        _id: "i19",
        code: "19",
        title: "Chalkboard XOR Game",
        description: `
You are given an array of integers nums represents the numbers written on a chalkboard. Alice and Bob take turns erasing exactly one number from the chalkboard, with Alice starting first. If erasing a number causes the bitwise XOR of all the elements of the chalkboard to become 0, then that player loses. Return true if and only if Alice wins the game, assuming both players play optimally.`,
        difficulty: "Hard",
        categories: [
            categories.find(cat => cat.name === "Brainteaser")!
        ],
        url: "https://leetcode.com/problems/chalkboard-xor-game/"
    },
    {
        _id: "i20",
        code: "20",
        title: "Trips and Users",
        description: `
Write a SQL solution to find the cancellation rate of requests with unbanned users (both client and driver must not be banned) each day between '2013-10-01' and '2013-10-03'. Round Cancellation Rate to two decimal points.`,
        difficulty: "Hard",
        categories: [
            categories.find(cat => cat.name === "Databases")!
        ],
        url: "https://leetcode.com/problems/trips-and-users/"
    }
];

export class MockQuestionRemoteDataSource {
    private questions: Question[] = [...initialQuestions];

    /**
     * Fetches all questions.
     * @returns Promise resolving to an array of Question objects.
     */
    async getAllQuestions(): Promise<Question[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.questions]), 300);
        });
    }

    /**
     * Fetches a single question by ID.
     * @param questionId - The unique identifier of the question.
     * @returns Promise resolving to the Question object.
     */
    async getQuestion(questionId: string): Promise<Question> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const question = this.questions.find((q) => q.code === questionId);
                if (question) {
                    resolve({ ...question });
                } else {
                    reject(new Error("Question not found"));
                }
            }, 300);
        });
    }

    /**
     * Creates a new question.
     * @param question - The question input data.
     * @returns Promise resolving with the status and created question.
     */
    async createQuestion(question: IQuestionInput): Promise<{ status: number; data: any }> {
        return new Promise(async (resolve, reject) => {
            try {
                const resolvedCategories = await Promise.all(
                    question.categories.map(async (catName) => {
                        let foundCategory = categories.find((cat) => cat.name === catName);
                        if (!foundCategory) {
                            foundCategory = await mockCategoryRemoteDataSource.createCategory(catName);
                        }
                        return foundCategory;
                    })
                );

                const questionId = (this.questions.length + 1).toString();
                const newQuestion: Question = {
                    ...question,
                    categories: resolvedCategories,
                    _id: "i" + questionId,
                    code: questionId
                };
                this.questions.push(newQuestion);

                resolve({
                    status: 201,
                    data: { message: "Created new question", question: newQuestion }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Updates an existing question.
     * @param questionId - The unique identifier of the question to update.
     * @param questionUpdate - The update data.
     * @returns Promise resolving with the status and updated question.
     */
    async updateQuestion(
        questionId: string,
        questionUpdate: IQuestionUpdateInput
    ): Promise<{ status: number; data: any }> {
        return new Promise(async (resolve, reject) => {
            try {
                const index = this.questions.findIndex((q) => q.code === questionId);
                if (index !== -1) {
                    let updatedCategories = this.questions[index].categories;

                    if (questionUpdate.categories) {
                        updatedCategories = await Promise.all(
                            questionUpdate.categories.map(async (catName) => {
                                let foundCategory = categories.find((cat) => cat.name === catName);
                                if (!foundCategory) {
                                    foundCategory = await mockCategoryRemoteDataSource.createCategory(catName);
                                }
                                return foundCategory;
                            })
                        );
                    }

                    const updatedQuestion = {
                        ...this.questions[index],
                        ...questionUpdate,
                        categories: updatedCategories
                    };
                    this.questions[index] = updatedQuestion;
                    resolve({ status: 200, data: { message: "Updated question", updatedQuestion } });
                } else {
                    reject(new Error("Question not found"));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes a question by ID.
     * @param questionId - The unique identifier of the question to delete.
     * @returns Promise resolving when the question is deleted.
     */
    async deleteQuestion(questionId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.questions.findIndex((q) => q.code === questionId);
                if (index !== -1) {
                    this.questions.splice(index, 1);
                    resolve();
                } else {
                    reject(new Error("Question not found"));
                }
            }, 300);
        });
    }
}

export const mockQuestionRemoteDataSource = new MockQuestionRemoteDataSource();