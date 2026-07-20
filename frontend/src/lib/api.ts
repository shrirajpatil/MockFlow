import { supabase, Workflow, WorkflowExecution } from './supabase';
import { Node, Edge } from 'reactflow';

export interface SaveWorkflowParams {
    name: string;
    description?: string;
    nodes: Node[];
    edges: Edge[];
    workspace?: string;
}

export interface UpdateWorkflowParams extends SaveWorkflowParams {
    id: string;
}

/**
 * Save a new workflow to the database
 */
export async function saveWorkflow(params: SaveWorkflowParams): Promise<Workflow | null> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .insert({
                name: params.name,
                description: params.description,
                nodes: params.nodes,
                edges: params.edges,
                version: '1.0',
                workspace: params.workspace || 'default',
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving workflow:', error.message);
            throw new Error(error.message || 'Failed to save workflow');
        }

        return data;
    } catch (error) {
        console.error('Error saving workflow:', error);
        throw error;
    }
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(params: UpdateWorkflowParams): Promise<Workflow | null> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .update({
                name: params.name,
                description: params.description,
                nodes: params.nodes,
                edges: params.edges,
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating workflow:', error.message);
            throw new Error(error.message || 'Failed to update workflow');
        }

        return data;
    } catch (error) {
        console.error('Error updating workflow:', error);
        throw error;
    }
}

/**
 * Load a workflow by ID
 */
export async function loadWorkflow(id: string): Promise<Workflow | null> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error loading workflow:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error loading workflow:', error);
        return null;
    }
}

/**
 * List workflows in a workspace. Workspaces are unauthenticated namespaces,
 * so every query must be scoped — never list across workspaces.
 */
export async function listWorkflows(workspace: string): Promise<Workflow[]> {
    try {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('workspace', workspace)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error listing workflows:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error listing workflows:', error);
        return [];
    }
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('workflows')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting workflow:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting workflow:', error);
        return false;
    }
}

/**
 * Save workflow execution result
 */
export async function saveWorkflowExecution(
    workflowId: string,
    requestData: any,
    responseData: any,
    status: 'success' | 'failed'
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('workflow_executions')
            .insert({
                workflow_id: workflowId,
                request_data: requestData,
                response_data: responseData,
                status,
            });

        if (error) {
            console.error('Error saving execution:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error saving execution:', error);
        return false;
    }
}

/**
 * List recent executions for a workflow (deployed endpoint calls,
 * recorded server-side by backend/src/mockEngine.ts).
 */
export async function listExecutions(workflowId: string, limit = 50): Promise<WorkflowExecution[]> {
    try {
        const { data, error } = await supabase
            .from('workflow_executions')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('executed_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error listing executions:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error listing executions:', error);
        return [];
    }
}

/**
 * Deploy a workflow (make it accessible via HTTP)
 */
export async function deployWorkflow(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('workflows')
            .update({
                deployed: true,
                deployed_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            console.error('Error deploying workflow:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deploying workflow:', error);
        return false;
    }
}

/**
 * Undeploy a workflow (remove HTTP access)
 */
export async function undeployWorkflow(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('workflows')
            .update({
                deployed: false,
            })
            .eq('id', id);

        if (error) {
            console.error('Error undeploying workflow:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error undeploying workflow:', error);
        return false;
    }
}


