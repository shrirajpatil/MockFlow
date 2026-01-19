import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    nodes: any[];
    edges: any[];
    version: string;
    deployed: boolean;
    deployed_at?: string;
    workspace: string;
    created_at: string;
    updated_at: string;
    user_id?: string;
}

export interface WorkflowExecution {
    id: string;
    workflow_id: string;
    request_data: any;
    response_data: any;
    status: 'success' | 'failed';
    executed_at: string;
}
