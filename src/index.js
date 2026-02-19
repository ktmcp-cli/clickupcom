import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  getTeams,
  listSpaces,
  getSpace,
  createSpace,
  listFolders,
  createFolder,
  listLists,
  getFolderlessLists,
  createList,
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTimeEntries,
  startTimer,
  stopTimer
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });

  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('ClickUp API key not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  clickupcom config set --api-key <key>'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('clickupcom')
  .description(chalk.bold('ClickUp CLI') + ' - Project management from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'ClickUp API Key')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess('API Key set');
    } else {
      printError('No options provided. Use --api-key');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    console.log(chalk.bold('\nClickUp CLI Configuration\n'));
    console.log('API Key: ', apiKey ? chalk.green('*'.repeat(16)) : chalk.red('not set'));
    console.log('');
  });

// ============================================================
// TEAMS
// ============================================================

const teamsCmd = program.command('teams').description('Manage teams');

teamsCmd
  .command('list')
  .description('List all teams')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const teams = await withSpinner('Fetching teams...', () => getTeams());

      if (options.json) {
        printJson(teams);
        return;
      }

      printTable(teams, [
        { key: 'id', label: 'Team ID' },
        { key: 'name', label: 'Name' },
        { key: 'color', label: 'Color' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// SPACES
// ============================================================

const spacesCmd = program.command('spaces').description('Manage spaces');

spacesCmd
  .command('list')
  .description('List spaces in a team')
  .requiredOption('--team-id <id>', 'Team ID')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const spaces = await withSpinner('Fetching spaces...', () => listSpaces(options.teamId));

      if (options.json) {
        printJson(spaces);
        return;
      }

      printTable(spaces, [
        { key: 'id', label: 'Space ID' },
        { key: 'name', label: 'Name' },
        { key: 'private', label: 'Private', format: (v) => v ? 'Yes' : 'No' },
        { key: 'statuses', label: 'Statuses', format: (v) => v?.length || 0 }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

spacesCmd
  .command('get <space-id>')
  .description('Get a specific space')
  .option('--json', 'Output as JSON')
  .action(async (spaceId, options) => {
    requireAuth();
    try {
      const space = await withSpinner('Fetching space...', () => getSpace(spaceId));

      if (options.json) {
        printJson(space);
        return;
      }

      console.log(chalk.bold('\nSpace Details\n'));
      console.log('Space ID:  ', chalk.cyan(space.id));
      console.log('Name:      ', chalk.bold(space.name));
      console.log('Private:   ', space.private ? chalk.yellow('Yes') : 'No');
      console.log('Statuses:  ', space.statuses?.length || 0);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

spacesCmd
  .command('create')
  .description('Create a new space')
  .requiredOption('--team-id <id>', 'Team ID')
  .requiredOption('--name <name>', 'Space name')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const space = await withSpinner('Creating space...', () =>
        createSpace({ teamId: options.teamId, name: options.name, features: {} })
      );

      if (options.json) {
        printJson(space);
        return;
      }

      printSuccess(`Space created: ${chalk.bold(space.name)}`);
      console.log('Space ID:', space.id);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// FOLDERS
// ============================================================

const foldersCmd = program.command('folders').description('Manage folders');

foldersCmd
  .command('list')
  .description('List folders in a space')
  .requiredOption('--space-id <id>', 'Space ID')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const folders = await withSpinner('Fetching folders...', () => listFolders(options.spaceId));

      if (options.json) {
        printJson(folders);
        return;
      }

      printTable(folders, [
        { key: 'id', label: 'Folder ID' },
        { key: 'name', label: 'Name' },
        { key: 'hidden', label: 'Hidden', format: (v) => v ? 'Yes' : 'No' },
        { key: 'task_count', label: 'Tasks' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

foldersCmd
  .command('create')
  .description('Create a new folder')
  .requiredOption('--space-id <id>', 'Space ID')
  .requiredOption('--name <name>', 'Folder name')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const folder = await withSpinner('Creating folder...', () =>
        createFolder({ spaceId: options.spaceId, name: options.name })
      );

      if (options.json) {
        printJson(folder);
        return;
      }

      printSuccess(`Folder created: ${chalk.bold(folder.name)}`);
      console.log('Folder ID:', folder.id);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// LISTS
// ============================================================

const listsCmd = program.command('lists').description('Manage lists');

listsCmd
  .command('list')
  .description('List all lists')
  .requiredOption('--folder-id <id>', 'Folder ID')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const lists = await withSpinner('Fetching lists...', () => listLists(options.folderId));

      if (options.json) {
        printJson(lists);
        return;
      }

      printTable(lists, [
        { key: 'id', label: 'List ID' },
        { key: 'name', label: 'Name' },
        { key: 'task_count', label: 'Tasks' },
        { key: 'status', label: 'Status', format: (v) => v?.status || 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

listsCmd
  .command('create')
  .description('Create a new list')
  .requiredOption('--folder-id <id>', 'Folder ID')
  .requiredOption('--name <name>', 'List name')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const list = await withSpinner('Creating list...', () =>
        createList({ folderId: options.folderId, name: options.name })
      );

      if (options.json) {
        printJson(list);
        return;
      }

      printSuccess(`List created: ${chalk.bold(list.name)}`);
      console.log('List ID:', list.id);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// TASKS
// ============================================================

const tasksCmd = program.command('tasks').description('Manage tasks');

tasksCmd
  .command('list')
  .description('List tasks in a list')
  .requiredOption('--list-id <id>', 'List ID')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const tasks = await withSpinner('Fetching tasks...', () => listTasks(options.listId));

      if (options.json) {
        printJson(tasks);
        return;
      }

      printTable(tasks, [
        { key: 'id', label: 'Task ID', format: (v) => v?.substring(0, 8) },
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status', format: (v) => v?.status || 'N/A' },
        { key: 'priority', label: 'Priority', format: (v) => v?.priority || 'None' },
        { key: 'due_date', label: 'Due Date', format: (v) => v ? new Date(parseInt(v)).toLocaleDateString() : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

tasksCmd
  .command('get <task-id>')
  .description('Get a specific task')
  .option('--json', 'Output as JSON')
  .action(async (taskId, options) => {
    requireAuth();
    try {
      const task = await withSpinner('Fetching task...', () => getTask(taskId));

      if (options.json) {
        printJson(task);
        return;
      }

      console.log(chalk.bold('\nTask Details\n'));
      console.log('Task ID:      ', chalk.cyan(task.id));
      console.log('Name:         ', chalk.bold(task.name));
      console.log('Status:       ', task.status?.status || 'N/A');
      console.log('Priority:     ', task.priority?.priority || 'None');
      console.log('Description:  ', task.description || 'N/A');
      console.log('Assignees:    ', task.assignees?.length || 0);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

tasksCmd
  .command('create')
  .description('Create a new task')
  .requiredOption('--list-id <id>', 'List ID')
  .requiredOption('--name <name>', 'Task name')
  .option('--description <desc>', 'Task description')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const task = await withSpinner('Creating task...', () =>
        createTask({
          listId: options.listId,
          name: options.name,
          description: options.description
        })
      );

      if (options.json) {
        printJson(task);
        return;
      }

      printSuccess(`Task created: ${chalk.bold(task.name)}`);
      console.log('Task ID:', task.id);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

tasksCmd
  .command('update <task-id>')
  .description('Update a task')
  .option('--name <name>', 'New task name')
  .option('--status <status>', 'New status')
  .option('--json', 'Output as JSON')
  .action(async (taskId, options) => {
    requireAuth();
    try {
      const updates = {};
      if (options.name) updates.name = options.name;
      if (options.status) updates.status = options.status;

      const task = await withSpinner('Updating task...', () => updateTask(taskId, updates));

      if (options.json) {
        printJson(task);
        return;
      }

      printSuccess('Task updated');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

tasksCmd
  .command('delete <task-id>')
  .description('Delete a task')
  .action(async (taskId) => {
    requireAuth();
    try {
      await withSpinner('Deleting task...', () => deleteTask(taskId));
      printSuccess('Task deleted');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// TIME TRACKING
// ============================================================

const timeCmd = program.command('time').description('Time tracking');

timeCmd
  .command('list')
  .description('List time entries')
  .requiredOption('--team-id <id>', 'Team ID')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const entries = await withSpinner('Fetching time entries...', () =>
        getTimeEntries(options.teamId)
      );

      if (options.json) {
        printJson(entries);
        return;
      }

      printTable(entries, [
        { key: 'id', label: 'Entry ID' },
        { key: 'task', label: 'Task', format: (v) => v?.name || 'N/A' },
        { key: 'duration', label: 'Duration (ms)' },
        { key: 'start', label: 'Start', format: (v) => v ? new Date(parseInt(v)).toLocaleString() : 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

timeCmd
  .command('start')
  .description('Start a timer')
  .requiredOption('--team-id <id>', 'Team ID')
  .requiredOption('--task-id <id>', 'Task ID')
  .option('--description <desc>', 'Time entry description')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const entry = await withSpinner('Starting timer...', () =>
        startTimer(options.teamId, options.taskId, options.description)
      );

      if (options.json) {
        printJson(entry);
        return;
      }

      printSuccess('Timer started');
      console.log('Entry ID:', entry.id);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

timeCmd
  .command('stop')
  .description('Stop the running timer')
  .requiredOption('--team-id <id>', 'Team ID')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const entry = await withSpinner('Stopping timer...', () => stopTimer(options.teamId));

      if (options.json) {
        printJson(entry);
        return;
      }

      printSuccess('Timer stopped');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
