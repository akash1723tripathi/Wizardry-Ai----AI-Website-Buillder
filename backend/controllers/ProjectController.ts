import { Request, Response } from 'express';
import prisma from "../lib/prisma.js";
import { extractHtml, generateCompletion, looksLikeHtml } from "../config/openAi.js";
import { CREDITS_PER_GENERATION } from "../config/plans.js";


//Controller Function to make revisions
export const makeRevision = async (req: Request, res: Response) => {
      const UserId = req.UserId;
      const { projectId } = req.params;
      // Only refund if the credits were actually taken
      let charged = false;
      try {
            const { revision_prompt } = req.body;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            if (!revision_prompt || revision_prompt.trim() === "") {
                  return res.status(400).json({ message: "Revision prompt is required" })
            }

            const currentProject = await prisma.websiteProject.findUnique({
                  where: { id: projectId as string, userId: UserId }
            })

            if (!currentProject) {
                  return res.status(404).json({ message: "Project not found" })
            }

            if (!currentProject.current_code) {
                  return res.status(400).json({ message: "Wait for your website to finish generating before requesting changes" })
            }

            // Spend atomically so simultaneous requests can't overdraw the balance
            const spend = await prisma.user.updateMany({
                  where: { id: UserId, credits: { gte: CREDITS_PER_GENERATION } },
                  data: { credits: { decrement: CREDITS_PER_GENERATION } }
            })
            if (spend.count === 0) {
                  return res.status(403).json({ message: "Not enough credits" })
            }
            charged = true;

            await prisma.conversation.create({
                  data: {
                        role: "user",
                        content: revision_prompt,
                        projectId: projectId as string
                  }
            })

            //To enhance user prompt (optional: falls back to the user's own words)
            const enhancedPrompt = await generateCompletion([
                  {
                        role: "system",
                        content: `
                        You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

                        Enhance this by:
                        1. Being specific about what elements to change
                        2. Mentioning design details (colors, spacing, sizes)
                        3. Clarifying the desired outcome
                        4. Using clear technical terms

                        Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).`
                  }, {
                        role: "user",
                        content: `User's request: "${revision_prompt}"`
                  }
            ], { maxTokens: 1500 }).catch(() => null)

            if (enhancedPrompt) {
                  await prisma.conversation.create({
                        data: {
                              role: "assistant",
                              content: `I have enhanced your prompt to "${enhancedPrompt}"`,
                              projectId: projectId as string
                        }
                  })
            }

            await prisma.conversation.create({
                  data: {
                        role: "assistant",
                        content: `Now making changes to your website...`,
                        projectId: projectId as string
                  }
            })

            //Generate website code
            const rawCode = await generateCompletion([
                  {
                        role: "system",
                        content: `
                        You are an expert web developer.

                        CRITICAL REQUIREMENTS:
                        - Return ONLY the complete updated HTML document, starting with <!DOCTYPE html> and ending with </html>.
                        - Keep everything the user did not ask to change.
                        - Use Tailwind CSS utility classes for all styling changes (NO custom CSS).
                        - Include all JavaScript in <script> tags before closing </body>
                        - Make sure it's a complete, standalone HTML document with Tailwind CSS

                        Do NOT include markdown, explanations, notes, or code fences.`
                  }, {
                        role: "user",
                        content: `Here's the current website code:\n${currentProject.current_code}\n\nThe user wants this change: ${enhancedPrompt || revision_prompt}`
                  }
            ], { maxTokens: 16000, accept: looksLikeHtml })

            const code = extractHtml(rawCode);

            const version = await prisma.version.create({
                  data: {
                        code,
                        description: 'Changes made',
                        projectId: projectId as string
                  }
            })

            await prisma.conversation.create({
                  data: {
                        role: "assistant",
                        content: `I've made the changes to your website. You can now preview it.`,
                        projectId: projectId as string
                  }
            })

            await prisma.websiteProject.update({
                  where: { id: projectId as string },
                  data: {
                        current_code: code,
                        current_version_index: version.id
                  }
            })

            res.json({ message: "Changes made successfully" })
      }
      catch (error: any) {
            console.log(error.code || error.message);
            if (charged) {
                  await prisma.user.update({
                        where: { id: UserId },
                        data: { credits: { increment: CREDITS_PER_GENERATION } }
                  }).catch(() => {})
                  await prisma.conversation.create({
                        data: {
                              role: "assistant",
                              content: `I couldn't apply that change. ${error.message || ''} Your ${CREDITS_PER_GENERATION} credits have been refunded.`,
                              projectId: projectId as string
                        }
                  }).catch(() => {})
            }
            res.status(500).json({ message: error.message })
      }
}

//Controller Function to roll back to a previous version
export const rollbackVersion = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            const { projectId, versionId } = req.params;

            const project = await prisma.websiteProject.findUnique({
                  where: { id: projectId as string, userId: UserId },
                  include: { versions: true }
            })

            if (!project) {
                  return res.status(404).json({ message: "Project not found" })
            }

            const version = project.versions.find((version) => version.id === versionId)

            if (!version) {
                  return res.status(404).json({ message: "Version not found" })
            }

            await prisma.websiteProject.update({
                  where: { id: projectId as string },
                  data: {
                        current_code: version.code,
                        current_version_index: version.id
                  }
            })

            await prisma.conversation.create({
                  data: {
                        role: "assistant",
                        content: "I have rolled back your website to the selected version.",
                        projectId: projectId as string
                  }
            })

            res.json({ message: "Rolled back successfully" })
      }
      catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}

//Delete any project
export const deleteProject = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            const { projectId } = req.params;

            await prisma.websiteProject.delete({
                  where: { id: projectId as string, userId: UserId }
            })

            res.json({ message: "Project deleted successfully" });
      }
      catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}

//Controller for getting project code for preview
export const getProjectPreview = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            const { projectId } = req.params;

            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            const project = await prisma.websiteProject.findFirst({
                  where: { id: projectId as string, userId: UserId },
                  include: { versions: true }
            })

            if (!project) {
                  return res.status(404).json({ message: "Project not found" })
            }
            res.json({ project });
      }
      catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}

//GetPublished Projects (public: only expose what the community page shows)
export const getPublishedProjects = async (req: Request, res: Response) => {
      try {
            const limit = Math.min(Math.max(Number(req.query.limit) || 60, 1), 100);
            const projects = await prisma.websiteProject.findMany({
                  where: { isPublished: true, current_code: { not: null } },
                  orderBy: { updatedAt: 'desc' },
                  take: limit,
                  select: {
                        id: true,
                        name: true,
                        initial_prompt: true,
                        current_code: true,
                        createdAt: true,
                        updatedAt: true,
                        user: { select: { name: true } }
                  }
            })
            res.json({ projects });
      }
      catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}

//Controller to a Get a single published project by id
export const getProjectById = async (req: Request, res: Response) => {
      try {
            const { projectId } = req.params;

            const project = await prisma.websiteProject.findFirst({
                  where: { id: projectId as string },
                  select: {
                        name: true,
                        isPublished: true,
                        current_code: true,
                        user: { select: { name: true } }
                  }
            })

            if (!project || project.isPublished === false || !project?.current_code) {
                  return res.status(404).json({ message: "Project not found" })
            }

            res.json({ code: project.current_code, name: project.name, author: project.user?.name });
      }
      catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}

//Controller to save changes in the project
export const saveProjectCode = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            const { projectId } = req.params;
            const { code } = req.body;

            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            if (!code) {
                  return res.status(400).json({ message: "Code is required" })
            }

            const project = await prisma.websiteProject.findFirst({
                  where: { id: projectId as string, userId: UserId },
                  include: { versions: true }
            })

            if (!project) {
                  return res.status(404).json({ message: "Project not found" })
            }

            await prisma.websiteProject.update({
                  where: { id: projectId as string },
                  data: {
                        current_code: code,
                        current_version_index: ""
                  }
            })

            res.json({ message: "Project saved successfully" });
      }
      catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}