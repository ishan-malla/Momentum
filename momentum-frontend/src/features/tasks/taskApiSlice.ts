import { apiSlice } from "@/api/apiSlice";
import { syncGamificationMutation } from "@/features/gamification/gamificationMutationSync";
import type { GamificationMutationPayload } from "@/features/gamification/gamificationTypes";
import type {
  Task,
  TaskCompletionHistory,
  TaskFrequency,
  TaskPayload,
} from "@/features/tasks/taskTypes";

type TaskApiResponse = {
  _id: string;
  name: string;
  description?: string;
  priority: Task["priority"];
  frequency: TaskFrequency;
  completed: boolean;
  completedAt?: string;
  completionHistory?: TaskCompletionHistory;
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
  completionHistory: task.completionHistory ?? {},
  reminder: Boolean(task.reminder),
  reminderOffsetDays: task.reminderOffsetDays ?? 0,
  scheduledDate: task.scheduledDate,
  scheduledTime: task.scheduledTime,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

type TaskUpdatePatch = Partial<TaskPayload> & {
  completed?: boolean;
  occurrenceDate?: string;
};

type TaskUpdateResponse = GamificationMutationPayload & {
  message: string;
  task: TaskApiResponse;
};

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
    updateTask: builder.mutation<
      { message: string; task: Task } & GamificationMutationPayload,
      { id: string; patch: TaskUpdatePatch }
    >({
      query: ({ id, patch }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: TaskUpdateResponse) => ({
        ...response,
        task: normalizeTask(response.task),
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        await syncGamificationMutation(dispatch, getState, queryFulfilled);
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Tasks" as const, id: arg.id },
        { type: "Tasks" as const, id: "LIST" },
        { type: "Friends" as const },
        { type: "Profile" as const },
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
