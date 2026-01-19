import { schedule } from '@netlify/functions';
import { supabase } from '../../src/db.js';

/**
 * Scheduled cleanup function for MockFlow
 * Runs every 10 minutes to prune data older than 40 minutes.
 * Ensures the platform remains ephemeral as requested.
 */
const handler = async (event: any) => {
    console.log('Cleanup trigger received at:', new Date().toISOString());

    try {
        const threshold = new Date(Date.now() - 40 * 60 * 1000).toISOString();

        // 1. Prune Workflows
        const { error: workflowError, count: workflowCount } = await supabase
            .from('workflows')
            .delete({ count: 'exact' })
            .lt('created_at', threshold);

        if (workflowError) throw workflowError;
        console.log(`Deleted ${workflowCount} expired workflows.`);

        // 2. Prune Audit Logs
        const { error: auditError, count: auditCount } = await supabase
            .from('workflow_audit_log')
            .delete({ count: 'exact' })
            .lt('created_at', threshold);

        if (auditError) throw auditError;
        console.log(`Deleted ${auditCount} expired audit logs.`);

        // 3. Prune Executions (if table exists)
        const { error: execError, count: execCount } = await supabase
            .from('workflow_executions')
            .delete({ count: 'exact' })
            .lt('created_at', threshold);

        if (!execError) {
            console.log(`Deleted ${execCount} expired executions.`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Cleanup successful',
                pruned: {
                    workflows: workflowCount,
                    auditLogs: auditCount,
                    executions: execCount
                }
            })
        };
    } catch (error: any) {
        console.error('Cleanup failed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Execute every 10 minutes: "*/10 * * * *"
export const config = {
    schedule: "*/10 * * * *"
};

export { handler };
