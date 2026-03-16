import { apiSlice } from "@/api/apiSlice";
import type { Task, TaskFrequency, TaskPayload } from "@/features/tasks/taskTypes";

type TaskApiResponse = {
  _id: string;
  name: string;
  description?: string;
  priority: Task["priority"];
  frequency: TaskFrequency;
  completed: boolean;
  completedAt?: string;
  reminder: boolean;
  reminderOffsetDays?: number;
  scheduledDate: string;
  scheduledTime: string;
  createdAt?: string;
  updatedAt?: string;
};

const normalizeTask = (task: TaskApiResponse): Task => ({
  id: task._id,
  name: task.name,
  description: task.description ?? "",
  priority: task.priority,
  frequency: task.frequency,
  completed: Boolean(task.completed),
  completedAt: task.completedAt,
  reminder: Boolean(task.reminder),
  reminderOffsetDays: task.reminderOffsetDays ?? 0,
  scheduledDate: task.scheduledDate,
  scheduledTime: task.scheduledTime,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], { frequency?: TaskFrequency } | void>({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: { tasks: TaskApiResponse[] } | TaskApiResponse[]) => {
        const tasks = Array.isArray(response) ? response : response.tasks;
        return tasks.map(normalizeTask);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((task) => ({ type: "Tasks" as const, id: task.id })),
              { type: "Tasks" as const, id: "LIST" },
            ]
          : [{ type: "Tasks" as const, id: "LIST" }],
    }),
    createTask: builder.mutation<Task, TaskPayload>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      transformResponse: (response: TaskApiResponse) => normalizeTask(response),
      invalidatesTags: [{ type: "Tasks" as const, id: "LIST" }],
    }),
    updateTask: builder.mutation<Task, { id: string; patch: Partial<TaskPayload> }>({
      query: ({ id, patch }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: TaskApiResponse) => normalizeTask(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Tasks" as const, id: arg.id },
        { type: "Tasks" as const, id: "LIST" },
      ],
    }),
    deleteTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Tasks" as const, id },
        { type: "Tasks" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApiSlice;
